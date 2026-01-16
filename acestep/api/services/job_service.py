import asyncio
import logging
import uuid
import time
import os
import re
import json
from typing import Dict, List, Optional

from fastapi import HTTPException
from acestep.api.schemas import GenerationRequest, JobStatus
from acestep.api.core.config import settings
from acestep.api.core.database import get_db
from acestep.api.core.model_manager import manager
from acestep.api.services.billing_service import BillingService

logger = logging.getLogger("ace_step_api.jobs")

# Global State
JOBS: Dict[str, JobStatus] = {}
TASK_QUEUE: asyncio.Queue = asyncio.Queue()
REQUEST_STORE: Dict[str, GenerationRequest] = {}

class JobService:
    
    @staticmethod
    async def submit_job(req: GenerationRequest) -> JobStatus:
        job_id = str(uuid.uuid4())
        
        # 1. Billing
        if req.user_id:
            # Check credits (Cost = 5 for now)
            BillingService.deduct_credits(req.user_id, 5, job_id, req.task)
            
        # 2. Enqueue
        job = JobStatus(
            job_id=job_id,
            status="queued",
            created_at=time.time(),
            progress=0.0,
            message="Queued for processing"
        )
        
        JOBS[job_id] = job
        REQUEST_STORE[job_id] = req
        
        await TASK_QUEUE.put(job_id)
        logger.info(f"Job {job_id} submitted.")
        return job

    @staticmethod
    def get_job(job_id: str) -> JobStatus:
        if job_id not in JOBS:
            raise HTTPException(status_code=404, detail="Job not found")
        return JOBS[job_id]

    @staticmethod
    async def process_jobs():
        """Background Worker Loop"""
        logger.info("Job Worker started.")
        loop = asyncio.get_running_loop()
        
        while True:
            job_id = await TASK_QUEUE.get()
            job = JOBS.get(job_id)
            if not job:
                TASK_QUEUE.task_done()
                continue

            req = REQUEST_STORE.get(job_id)
            if not req:
                logger.error(f"Request data missing for job {job_id}")
                job.status = "failed"
                job.error = "Request data corrupt"
                TASK_QUEUE.task_done()
                continue
            
            try:
                job.status = "processing"
                job.progress = 0.05
                job.message = "Initializing pipeline..."
                
                # Progress Callback
                def progress_callback(p, desc=""):
                    job.progress = p
                    job.message = desc
                
                logger.info(f"Generating for Job {job_id}...")
                engine = manager.get_engine()
                
                pipeline_params = {
                    "prompt": req.prompt,
                    "lyrics": req.lyrics or "",
                    "duration": req.duration,
                    "steps": req.infer_steps,
                    "cfg_scale": req.guidance_scale,
                    "seed": req.seed,
                    "cfg_type": req.cfg_type,
                    "scheduler_type": req.scheduler_type,
                    "use_erg_lyric": False,
                    "format": req.format,
                    "progress": progress_callback,
                    "task": req.task,
                    "retake_variance": req.retake_variance,
                    "repaint_start": req.repaint_start,
                    "repaint_end": req.repaint_end
                }
                
                output_paths = await loop.run_in_executor(
                    None, 
                    lambda: engine.generate(pipeline_params)
                )
                
                file_results = [p for p in output_paths if isinstance(p, str)]
                
                # --- Post Processing (Rename & Metadata) ---
                file_results = JobService._handle_renaming(file_results, req, job_id)
                JobService._inject_metadata(file_results, req)
                
                # --- Cloud Sync ---
                cloud_urls = JobService._sync_to_cloud(file_results)
                
                job.status = "completed"
                job.progress = 1.0
                job.message = "Generation complete"
                job.result = file_results # Returning Local Paths (Frontend handles URL conversion)
                
                logger.info(f"Job {job_id} completed.")

            except Exception as e:
                logger.error(f"Job {job_id} failed: {e}")
                job.status = "failed"
                job.error = str(e)
                job.message = "Failed"
            
            finally:
                if job_id in REQUEST_STORE:
                    del REQUEST_STORE[job_id]
                TASK_QUEUE.task_done()

    @staticmethod
    def _handle_renaming(file_results: List[str], req: GenerationRequest, job_id: str) -> List[str]:
        final_results = []
        if req.title and file_results:
            try:
                safe_title = re.sub(r'[\\/*?:"<>|]', "", req.title).replace(" ", "_")
                safe_title = safe_title[:50]
                
                for old_path in file_results:
                    if not old_path.lower().endswith(('.wav', '.mp3', '.flac')):
                        final_results.append(old_path)
                        continue

                    dir_name = os.path.dirname(old_path)
                    ext = os.path.splitext(old_path)[1]
                    short_id = job_id[:8]
                    
                    new_filename = f"{safe_title}_{short_id}{ext}"
                    new_path = os.path.join(dir_name, new_filename)
                    
                    os.rename(old_path, new_path)
                    final_results.append(new_path)
                    
                    # Sidecar
                    old_json = os.path.splitext(old_path)[0] + ".json"
                    new_json = os.path.splitext(new_path)[0] + ".json"
                    if os.path.exists(old_json):
                         os.rename(old_json, new_json)
                return final_results
            except Exception as e:
                 logger.error(f"Renaming failed: {e}")
                 return file_results
        return file_results

    @staticmethod
    def _inject_metadata(file_results: List[str], req: GenerationRequest):
        if (req.parent_id or req.cover_image or req.title) and file_results:
            try:
                for result_path in file_results:
                        if result_path.lower().endswith(('.wav', '.mp3', '.flac')):
                            json_path = os.path.splitext(result_path)[0] + ".json"
                            meta = {}
                            if os.path.exists(json_path):
                                with open(json_path, 'r', encoding='utf-8') as f:
                                    try: meta = json.load(f)
                                    except: pass
                            
                            if req.title: meta['title'] = req.title
                            if req.parent_id: meta['parent_id'] = req.parent_id
                            if req.cover_image: meta['cover_image'] = req.cover_image
                            
                            with open(json_path, 'w', encoding='utf-8') as f:
                                json.dump(meta, f, indent=4, ensure_ascii=False)
            except Exception as e:
                logger.error(f"Metadata injection failed: {e}")

    @staticmethod
    def _sync_to_cloud(file_results: List[str]) -> List[str]:
        supabase = get_db()
        cloud_urls = []
        if supabase and file_results:
            for local_path in file_results:
                try:
                    filename = os.path.basename(local_path)
                    bucket_name = "music"
                    storage_path = f"generated/{filename}"
                    
                    with open(local_path, 'rb') as f:
                        supabase.storage.from_(bucket_name).upload(storage_path, f, file_options={"upsert": "true"})
                    
                    res = supabase.storage.from_(bucket_name).get_public_url(storage_path)
                    if res: return_url = res # supabase-py returns string or obj? usually string url
                    # In newer v2 helper it returns string url directly or via .public_url
                    # Let's assume the previous code `res` was the URL.
                    # Wait, previous code: `res = ...get_public_url(...)`.
                    cloud_urls.append(res)
                    logger.info(f"Uploaded: {filename}")
                except Exception as up_err:
                    logger.error(f"Upload Failed for {local_path}: {up_err}")
        return cloud_urls

    @staticmethod
    def delete_local_file(filename: str):
        output_dir = settings.OUTPUT_DIR
        if ".." in filename or "/" in filename or "\\" in filename:
             raise HTTPException(status_code=400, detail="Invalid filename")

        file_path = os.path.join(output_dir, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
            
        try:
            os.remove(file_path)
            # Remove JSON Sidecars
            base_name = os.path.splitext(filename)[0]
            for c in [base_name + ".json", base_name + "_input_params.json"]:
                p = os.path.join(output_dir, c)
                if os.path.exists(p): os.remove(p)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def rename_local_file(filename: str, new_name: str):
        output_dir = settings.OUTPUT_DIR
        if any(x in filename for x in ["..", "/", "\\"]) or any(x in new_name for x in ["..", "/", "\\"]):
             raise HTTPException(status_code=400, detail="Invalid filename")

        old_path = os.path.join(output_dir, filename)
        if not os.path.exists(old_path):
            raise HTTPException(status_code=404, detail="File not found")

        ext = os.path.splitext(filename)[1]
        if not new_name.lower().endswith(ext.lower()):
            new_name += ext
            
        new_path = os.path.join(output_dir, new_name)
        if os.path.exists(new_path):
            raise HTTPException(status_code=409, detail="File exists")

        try:
            os.rename(old_path, new_path)
            # Rename JSONs
            base_old = os.path.splitext(filename)[0]
            base_new = os.path.splitext(new_name)[0]
            for old_j, new_j in [(base_old + ".json", base_new + ".json"), (base_old + "_input_params.json", base_new + "_input_params.json")]:
                p_old = os.path.join(output_dir, old_j)
                if os.path.exists(p_old):
                     os.rename(p_old, os.path.join(output_dir, new_j))
            return {"old": filename, "new": new_name}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
