from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GenerationRequest(BaseModel):
    title: Optional[str] = None
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
    cover_image: Optional[str] = None
    user_id: Optional[str] = None

class JobStatus(BaseModel):
    job_id: str
    status: str  # queued, processing, completed, failed
    created_at: float
    progress: float = 0.0
    message: str = ""
    result: Optional[List[str]] = None # List of file paths or URLs
    error: Optional[str] = None

class LyricsRequest(BaseModel):
    topic: str
    mood: str
    language: str
    model: str

class AgentChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
