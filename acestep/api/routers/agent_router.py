from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from acestep.api.schemas import AgentChatRequest, LyricsRequest
from acestep.api.services.agent_service import AgentService

router = APIRouter()

@router.get("/llm/models")
async def get_llm_models():
    return {"models": AgentService.get_models()}

@router.post("/llm/generate_lyrics")
async def generate_lyrics_endpoint(req: LyricsRequest):
    try:
        lyrics = AgentService.generate_lyrics(req.topic, req.mood, req.language, req.model)
        return {"lyrics": lyrics}
    except Exception as e:
        raise e

@router.post("/agent/chat")
async def chat_with_producer(req: AgentChatRequest):
    """
    Streaming Endpoint for Agent Interaction.
    """
    return StreamingResponse(
        AgentService.chat_stream(req.message, req.history), 
        media_type="application/x-ndjson"
    )
