import requests
import json
from typing import AsyncGenerator, Dict, List
from fastapi import HTTPException
from acestep.api.core.config import settings
from acestep.api.agents.director import process_user_intent

class AgentService:
    @staticmethod
    def get_models() -> List[str]:
        try:
            res = requests.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=5)
            if res.status_code == 200:
                data = res.json()
                return [m["name"] for m in data.get("models", [])]
        except Exception:
            pass
        return []

    @staticmethod
    def generate_lyrics(topic: str, mood: str, language: str, model: str) -> str:
        prompt = (
            f"Write song lyrics. \n"
            f"Topic: {topic}\n"
            f"Mood: {mood}\n"
            f"Language: {language}\n"
            f"Requirements: Use the structure [verse], [chorus], [bridge]. "
            f"Output ONLY the lyrics. Do not add conversational text."
        )
        
        try:
            res = requests.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json={
                "model": model,
                "prompt": prompt,
                "stream": False
            }, timeout=60)
            
            if res.status_code == 200:
                return res.json().get("response", "")
            else:
                raise HTTPException(status_code=500, detail=f"Ollama API Error: {res.text}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Ollama Unreachable: {e}")

    @staticmethod
    async def chat_stream(message: str, history: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        # Iterate over the Director's generator
        async for chunk in process_user_intent(message, history):
             yield chunk + "\n"
