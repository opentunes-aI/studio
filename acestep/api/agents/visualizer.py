from smolagents import CodeAgent, LiteLLMModel, tool
from typing import Dict, Any
import urllib.parse
import os
import random

OLLAMA_URL = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")
AGENT_MODEL = os.getenv("AGENT_MODEL_ID", "ollama/qwen2.5:3b")
model = LiteLLMModel(model_id=AGENT_MODEL, api_base=OLLAMA_URL)

@tool
def generate_cover_art(description: str) -> Dict[str, Any]:
    """
    Generates a cover image URL using Pollinations.ai.

    Args:
        description: A visual description (e.g. "Cyberpunk city, neon lights").
    """
    encoded = urllib.parse.quote(description)
    seed = random.randint(1, 100000)
    url = f"https://image.pollinations.ai/prompt/{encoded}?seed={seed}&model=flux&width=768&height=432"
    return {
        "action": "generate_cover_art",
        "params": { "image_url": url, "description": description, "seed": seed }
    }

visualizer_agent = CodeAgent(
    tools=[generate_cover_art],
    model=model,
    add_base_tools=False,
    description="You are a Visual Director. Create stunning cover art descriptions matching the music's vibe."
)
