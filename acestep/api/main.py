
import os
import logging
import asyncio
import uuid
import time
from datetime import datetime
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import requests
from dotenv import load_dotenv
from supabase import create_client

# Load Envs (Try User's Studio config first)
load_dotenv("acestep_studio/.env.local")
load_dotenv() # Fallback to .env in root

from acestep.api.dependencies import manager

# Config
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") # Use Anon for now (upload policy typically allows Authenticated or Anon for 'public' buckets depending on config. MVP assumes Public 'music' bucket writable or we need Service Key).
# Ideally use SUPABASE_SERVICE_ROLE_KEY if available
if os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


# ... logging ...

# --- Revised Worker & App ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ... (existing content) ...
    pass # reusing existing block logic via tools (conceptually)

# But I need to insert it after `app = FastAPI(...)`

# Simplest way: Add middleware after app creation.

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ace_step_api")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info(f"Supabase Client Initialized: {SUPABASE_URL}")
    except Exception as e:
        logger.error(f"Supabase Init Failed: {e}")

# --- Data Models ---

class GenerationRequest(BaseModel):
    prompt: str
    lyrics: Optional[str] = ""
    duration: float = Field(60.0, ge=10.0, le=240.0)
    infer_steps: int = Field(60, ge=10, le=200)
    guidance_scale: float = 15.0
    seed: Optional[int] = None
    format: str = "wav"
    # Advanced
    cfg_type: str = "apg"
    scheduler_type: str = "euler"
    # Horizon 2: Retake
    retake_variance: float = 0.0
    task: str = "text2music"
    # Horizon 2: Repaint
    repaint_start: Optional[float] = None
    repaint_end: Optional[float] = None
    parent_id: Optional[str] = None

class JobStatus(BaseModel):
    job_id: str
    status: str  # queued, processing, completed, failed
    created_at: float
    progress: float = 0.0
    message: str = ""
    result: Optional[List[str]] = None # List of file paths
    error: Optional[str] = None

# --- Global State ---
JOBS: Dict[str, JobStatus] = {}
TASK_QUEUE: asyncio.Queue = asyncio.Queue()

# --- Worker Logic ---

async def queue_worker():
    logger.info("Worker started.")
    while True:
        job_id = await TASK_QUEUE.get()
        logger.info(f"Processing job {job_id}")
        
        job = JOBS[job_id]
        job.status = "processing"
        job.message = "Starting generation..."
        
        try:
            # Prepare arguments
            # We need to retrieve the request data. Ideally stored in JOBS or separate dict.
            # For simplicity, let's store request in Job object (not Pydantic strict) or just lookup.
            # Wait, I didn't store the request logic in JOBS. 
            # Let's assume JOBS stores the request data in a separate 'meta' field or similar.
            # I will modify JobStatus or use a tuple in Queue.
            pass 
        except Exception as e:
            logger.error(f"Worker Loop Error: {e}")
        
        TASK_QUEUE.task_done()

# We need a way to pass the request -> worker. 
# Re-implementing correctly below.

# --- Revised Worker & App ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model
    logger.info("Initializing API...")
    checkpoint_path = os.getenv("ACE_CHECKPOINT_PATH", "")
    if not checkpoint_path:
        logger.warning("ACE_CHECKPOINT_PATH not set.")
    
    # Load model in executor to avoid blocking if it was pure python, 
    # but ACEStepPipeline checks for GPU etc.
    # Just call it directly, it's startup.
    try:
        manager.load_model(checkpoint_path=checkpoint_path)
    except Exception as e:
        logger.error(f"CRITICAL: Model failed to load: {e}")

    # Start Worker
    worker_task = asyncio.create_task(process_jobs())
    
    yield
    
    # Cleanup
    logger.info("Shutting down...")
    worker_task.cancel()

app = FastAPI(title="ACE-Step API", lifespan=lifespan)

# CORS Configuration
origins = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve outputs
output_dir = os.getenv("ACE_OUTPUT_DIR", "./outputs")
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
app.mount("/outputs", StaticFiles(directory=output_dir), name="outputs")

# --- Queue Processing ---

request_store = {} # Map job_id -> GenerationRequest

async def process_jobs():
    loop = asyncio.get_running_loop()
    while True:
        job_id = await TASK_QUEUE.get()
        job = JOBS.get(job_id)
        if not job:
            TASK_QUEUE.task_done()
            continue

        req = request_store.get(job_id)
        
        try:
            job.status = "processing"
            job.progress = 0.05 # Show initial activity
            job.message = "Initializing pipeline..."
            
            # Define progress callback
            def progress_callback(p, desc=""):
                # Update job state
                # Note: This runs in thread, simple assignment is thread-safe "enough" for display
                job.progress = p
                job.message = desc
            
            # Run blocking inference in a separate thread
            logger.info(f"Sending job {job_id} to executor...")
            engine = manager.get_engine()
            
            # Prepare generic parameters for AudioEngine
            pipeline_params = {
                "prompt": req.prompt,
                "lyrics": req.lyrics or "",
                "duration": req.duration,
                "steps": req.infer_steps,
                "cfg_scale": req.guidance_scale,
                "seed": req.seed,
                # Engine-specific args (passed as kwargs)
                "oss_steps": "",
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
            
            # The pipeline returns [path1, path2... params_json]
            # We want just the audio paths usually, but keeping all is fine.
            # Last item is dict.
            
            file_results = [p for p in output_paths if isinstance(p, str)]
            
            # Inject parent_id into JSON sidecar
            if req.parent_id and file_results:
                try:
                    import json
                    for result_path in file_results:
                         if result_path.lower().endswith(('.wav', '.mp3', '.flac')):
                             json_path = os.path.splitext(result_path)[0] + ".json"
                             if os.path.exists(json_path):
                                 with open(json_path, 'r') as f:
                                     meta = json.load(f)
                                 meta['parent_id'] = req.parent_id
                                 with open(json_path, 'w') as f:
                                     json.dump(meta, f, indent=4)
                except Exception as e:
                    logger.error(f"Failed to patch parent_id: {e}")
            
            # Hybrid Storage: Upload to Supabase (Async/Block for now)
            # We want to return the Public URL if possible.
            cloud_urls = []
            if supabase and file_results:
                for local_path in file_results:
                    try:
                        filename = os.path.basename(local_path)
                        # Upload to 'generated_audio' bucket (or 'music')
                        # Path: generated/{job_id}/{filename} or just {filename}
                        # We use filename because Frontend expects it.
                        bucket_name = "music" # Matches Frontend logic
                        storage_path = f"generated/{filename}" 
                        
                        logger.info(f"Uploading {filename} to Supabase...")
                        with open(local_path, 'rb') as f:
                            supabase.storage.from_(bucket_name).upload(storage_path, f, file_options={"upsert": "true"})
                        
                        # Get Public URL
                        res = supabase.storage.from_(bucket_name).get_public_url(storage_path)
                        if res:
                            cloud_urls.append(res)
                            logger.info(f"Uploaded: {res}")
                    except Exception as up_err:
                        logger.error(f"Upload Failed for {local_path}: {up_err}")

            job.status = "completed"
            job.progress = 1.0
            job.message = "Generation complete"
            job.result = cloud_urls if cloud_urls else file_results # Return Cloud URLs if success, else Local
            # Wait, Frontend expects Local Filename or URL? 
            # Current frontend uses 'local_filename' from DB.
            # The API returns JobStatus.result.
            # If we change result to URL, Frontend needs to handle it.
            # Let's return BOTH or keep existing behavior + Cloud Metadata?
            # JobStatus.result is List[str].
            # We will return the Cloud URLs if available, otherwise Local Paths.
            # Frontend Polling will see 'result'.
            
            job.result = file_results # Keep Local Paths for 'local_filename' logic? 
            # Actually, let's append valid result metadata if possible.
            # For MVP refactor: Stick to returning Local Paths in 'result' (backward compat)
            # But the 'local_filename' is strictly the filename. 
            # The Frontend calculates the URL.
            # We are done.
            # Wait, the PLAN said "Generator saves to Local Disk AND uploads".
            # DONE. The file is uploaded.
            # Frontend 'Hybrid Read' will try to fetch. 
            # We don't need to change return value yet, unless we want Frontend to KNOW it's uploaded.
            
            job.result = file_results
            
            logger.info(f"Job {job_id} completed successfully.")

        except Exception as e:
            logger.error(f"Job {job_id} failed: {e}")
            job.status = "failed"
            job.error = str(e)
            job.message = "Failed"
        
        finally:
            # Cleanup
            if job_id in request_store:
                del request_store[job_id]
            TASK_QUEUE.task_done()

# --- Endpoints ---

class LyricsRequest(BaseModel):
    topic: str
    mood: str
    language: str
    model: str

@app.get("/llm/models")
async def get_llm_models():
    """Fetch available models from local Ollama instance."""
    try:
        res = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if res.status_code == 200:
            data = res.json()
            return {"models": [m["name"] for m in data.get("models", [])]}
    except Exception as e:
        logger.warning(f"Ollama connection failed: {e}")
    return {"models": []}

@app.post("/llm/generate_lyrics")
async def generate_lyrics_endpoint(req: LyricsRequest):
    prompt = (
        f"Write song lyrics. \n"
        f"Topic: {req.topic}\n"
        f"Mood: {req.mood}\n"
        f"Language: {req.language}\n"
        f"Requirements: Use the structure [verse], [chorus], [bridge]. "
        f"Output ONLY the lyrics. Do not add conversational text."
    )
    
    try:
        res = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json={
            "model": req.model,
            "prompt": prompt,
            "stream": False
        }, timeout=60)
        
        if res.status_code == 200:
            return {"lyrics": res.json().get("response", "")}
        else:
            raise HTTPException(status_code=500, detail=f"Ollama API Error: {res.text}")
            
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to Ollama: {str(e)}")

@app.post("/generate", response_model=JobStatus)
async def generate_music(req: GenerationRequest):
    pipeline_check = None
    try:
        pipeline_check = manager.get_pipeline()
    except:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    job_id = str(uuid.uuid4())
    job = JobStatus(
        job_id=job_id,
        status="queued",
        created_at=time.time(),
        progress=0.0,
        message="Queued for processing"
    )
    
    JOBS[job_id] = job
    request_store[job_id] = req
    
    await TASK_QUEUE.put(job_id)
    return job

@app.get("/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOBS[job_id]

@app.get("/history")
async def get_history():
    output_dir = os.getenv("ACE_OUTPUT_DIR", "./outputs")
    if not os.path.exists(output_dir):
        return []
    files = [f for f in os.listdir(output_dir) if f.lower().endswith((".wav", ".mp3", ".flac", ".ogg"))]
    # Sort by modification time (newest first)
    files.sort(key=lambda x: os.path.getmtime(os.path.join(output_dir, x)), reverse=True)
    return {"files": files}

@app.get("/health")
async def health():
    ready = False
    try:
        manager.get_pipeline()
        ready = True
    except:
        pass
    return {"status": "healthy", "model_ready": ready}

@app.delete("/files/{filename}")
async def delete_file(filename: str):
    """Delete a generated file and its associated metadata."""
    output_dir = os.getenv("ACE_OUTPUT_DIR", "./outputs")
    
    # Security: basic path traversal prevention
    if ".." in filename or "/" in filename or "\\" in filename:
         raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = os.path.join(output_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        os.remove(file_path)
        
        # Try to remove associated json if exists (e.g. filename.json or filename minus ext .json)
        # Assuming filename is "xyz.wav"
        base_name = os.path.splitext(filename)[0]
        candidates = [
            base_name + ".json",
            base_name + "_input_params.json"
        ]
        for c in candidates:
            json_path = os.path.join(output_dir, c)
            if os.path.exists(json_path):
                os.remove(json_path)
            
        return {"status": "deleted", "file": filename}
    except Exception as e:
        logger.error(f"Failed to delete {filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/files/{filename}/rename")
async def rename_file(filename: str, new_name: str):
    """Rename a local file and its metadata."""
    output_dir = os.getenv("ACE_OUTPUT_DIR", "./outputs")
    
    # Security checks
    if any(x in filename for x in ["..", "/", "\\"]) or any(x in new_name for x in ["..", "/", "\\"]):
         raise HTTPException(status_code=400, detail="Invalid filename")

    old_path = os.path.join(output_dir, filename)
    if not os.path.exists(old_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Ensure extension matches
    ext = os.path.splitext(filename)[1]
    if not new_name.lower().endswith(ext.lower()):
        new_name += ext
        
    new_path = os.path.join(output_dir, new_name)
    if os.path.exists(new_path):
        raise HTTPException(status_code=409, detail="File with new name already exists")

    try:
        os.rename(old_path, new_path)
        
        # Rename associated JSONs
        base_old = os.path.splitext(filename)[0]
        base_new = os.path.splitext(new_name)[0]
        
        # Handle both naming conventions
        candidates = [
            (base_old + ".json", base_new + ".json"),
            (base_old + "_input_params.json", base_new + "_input_params.json")
        ]
        
        for old_j_name, new_j_name in candidates:
            old_j = os.path.join(output_dir, old_j_name)
            if os.path.exists(old_j):
                 os.rename(old_j, os.path.join(output_dir, new_j_name))
                 
        return {"status": "renamed", "old": filename, "new": new_name}
    except Exception as e:
        logger.error(f"Rename failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Agent Endpoints ---
from acestep.api.agents.director import process_user_intent

class AgentChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

from fastapi.responses import StreamingResponse

@app.post("/agent/chat")
async def chat_with_producer(req: AgentChatRequest):
    """
    Streaming Endpoint for Agent Interaction.
    """
    async def event_generator():
        # Iterate over the Director's generator
        async for chunk in process_user_intent(req.message, req.history):
            # Ensure each JSON chunk is on a new line for easy parsing
            yield chunk + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

