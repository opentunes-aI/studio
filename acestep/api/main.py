
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

from acestep.api.dependencies import manager

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
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
            job.message = "Initializing pipeline..."
            
            # Define progress callback
            def progress_callback(p, desc=""):
                # Update job state
                # Note: This runs in thread, simple assignment is thread-safe "enough" for display
                job.progress = p
                job.message = desc
            
            # Run blocking inference in a separate thread
            logger.info(f"Sending job {job_id} to executor...")
            pipeline = manager.get_pipeline()
            
            # Prepare args for pipeline
            # ACEStepPipeline.__call__ signature
            # We map request params to pipeline params
            
            output_paths = await loop.run_in_executor(
                None, 
                lambda: pipeline(
                    prompt=req.prompt,
                    lyrics=req.lyrics or "", 
                    oss_steps="",
                    audio_duration=req.duration,
                    infer_step=req.infer_steps,
                    guidance_scale=req.guidance_scale,
                    cfg_type=req.cfg_type,
                    scheduler_type=req.scheduler_type,
                    use_erg_lyric=False, # Match Gradio default for better vocals
                    manual_seeds=[req.seed] if req.seed is not None else None,
                    format=req.format,
                    progress=progress_callback,
                    # Retake params
                    task=req.task,
                    retake_variance=req.retake_variance,
                    # Repaint params
                    repaint_start=req.repaint_start,
                    repaint_end=req.repaint_end
                )
            )
            
            # The pipeline returns [path1, path2... params_json]
            # We want just the audio paths usually, but keeping all is fine.
            # Last item is dict.
            
            file_results = [p for p in output_paths if isinstance(p, str)]
            
            job.status = "completed"
            job.progress = 1.0
            job.message = "Generation complete"
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
        res = requests.get("http://localhost:11434/api/tags", timeout=5)
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
        res = requests.post("http://localhost:11434/api/generate", json={
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
    files.sort(reverse=True) # newest first
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

# --- Agent Endpoints ---
from acestep.api.agent_service import process_user_intent

class AgentChatRequest(BaseModel):
    message: str

@app.post("/agent/chat")
async def chat_with_producer(req: AgentChatRequest):
    """
    Talk to the AI Producer Agent to configure studio parameters.
    """
    # Run in threadpool to avoid blocking event loop
    return await asyncio.to_thread(process_user_intent, req.message)

