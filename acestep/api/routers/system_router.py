from fastapi import APIRouter
from acestep.api.core.model_manager import manager

router = APIRouter()

@router.get("/ping")
def ping():
    return {"status": "pong"}

@router.get("/health")
async def health():
    ready = False
    try:
        manager.get_pipeline()
        ready = True
    except:
        pass
    return {"status": "healthy", "model_ready": ready}
