from fastapi import APIRouter
from acestep.api.schemas import GenerationRequest, JobStatus
from acestep.api.services.job_service import JobService
from acestep.api.core.config import settings
from acestep.api.rag import rag_engine
import os
import json

router = APIRouter()

@router.post("/generate", response_model=JobStatus)
async def generate_music(req: GenerationRequest):
    return await JobService.submit_job(req)

@router.get("/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    return JobService.get_job(job_id)

@router.get("/history")
async def get_history():
    output_dir = settings.OUTPUT_DIR
    if not os.path.exists(output_dir):
        return {"files": []}
        
    files = [f for f in os.listdir(output_dir) if f.lower().endswith((".wav", ".mp3", ".flac", ".ogg"))]
    # Sort by modification time (newest first)
    files.sort(key=lambda x: os.path.getmtime(os.path.join(output_dir, x)), reverse=True)
    return {"files": files}

@router.delete("/files/{filename}")
async def delete_file(filename: str):
    JobService.delete_local_file(filename)
    return {"status": "deleted", "file": filename}

@router.patch("/files/{filename}/rename")
async def rename_file(filename: str, new_name: str):
    res = JobService.rename_local_file(filename, new_name)
    return {"status": "renamed", **res}

@router.post("/files/{filename}/star")
async def star_file(filename: str):
    """
    Indexes the file's prompt and lyrics into Agent Memory (RAG).
    """
    output_dir = settings.OUTPUT_DIR
    base_name = os.path.splitext(filename)[0]
    
    # Try looking for sidecar JSON
    json_path = os.path.join(output_dir, base_name + ".json")
    meta = {}
    
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
        except: pass
    
    # Also look for input_params if above is empty or missing
    if not meta:
        params_path = os.path.join(output_dir, base_name + "_input_params.json")
        if os.path.exists(params_path):
            try:
                with open(params_path, 'r', encoding='utf-8') as f:
                    meta = json.load(f)
            except: pass

    indexed_count = 0
    
    # Index Audio Prompt
    if meta.get("prompt"):
        rag_engine.index_item(
            content=meta["prompt"], 
            type="audio_prompt", 
            metadata={"filename": filename}
        )
        indexed_count += 1
        
    # Index Lyrics
    if meta.get("lyrics"):
        rag_engine.index_item(
            content=meta["lyrics"], 
            type="lyrics", 
            metadata={"filename": filename}
        )
        indexed_count += 1

    return {
        "status": "starred", 
        "indexed_items": indexed_count,
        "message": "Saved to Agent Memory" if indexed_count > 0 else "No metadata found to index"
    }
