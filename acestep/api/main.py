import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from acestep.api.core.config import settings
from acestep.api.core.model_manager import manager
from acestep.api.services.job_service import JobService

from acestep.api.routers import music_router, agent_router, system_router

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ace_step_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load Model (Async/Threaded lazy load handled by manager)
    logger.info("Starting ACE-Step API...")
    if not settings.ACE_CHECKPOINT_PATH:
        logger.warning("ACE_CHECKPOINT_PATH not set.")

    # Start Worker
    worker_task = asyncio.create_task(JobService.process_jobs())
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    worker_task.cancel()

app = FastAPI(title=settings.API_TITLE, version=settings.API_VERSION, lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(system_router.router) # /ping, /health
app.include_router(music_router.router) # /generate, /history
app.include_router(agent_router.router) # /agent/chat, /llm/*

# Static Files
app.mount("/outputs", StaticFiles(directory=settings.OUTPUT_DIR), name="outputs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
