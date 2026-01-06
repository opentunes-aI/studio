from smolagents import CodeAgent, LiteLLMModel, tool
from typing import Dict, Any, Optional
from acestep.api.rag import rag_engine
import os

# Model Setup
OLLAMA_URL = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")
AGENT_MODEL = os.getenv("AGENT_MODEL_ID", "ollama/qwen2.5:3b")
model = LiteLLMModel(model_id=AGENT_MODEL, api_base=OLLAMA_URL)

@tool
def configure_studio(prompt: str, steps: int = 50, cfg_scale: float = 10.0, duration: float = 60.0, seed: Optional[int] = None) -> Dict[str, Any]:
    """
    Configures the music studio with specific parameters.

    Args:
        prompt: The text prompt describing the music (genre, mood, instruments).
        steps: Quality steps (20-100). Default 50.
        cfg_scale: Guidance scale (3.0-20.0). Default 10.0.
        duration: Length in seconds (10-240).
        seed: Random seed.
    """
    return {
        "action": "configure",
        "params": { 
            "prompt": prompt, 
            "steps": int(steps), 
            "cfg_scale": float(cfg_scale), 
            "duration": float(duration), 
            "seed": int(seed) if seed is not None else None 
        }
    }

@tool
def search_audio_library(query: str) -> str:
    """
    Searches the Agent Memory for previous successful audio prompts.
    Use this to learn what descriptions work best for a specific genre or mood.

    Args:
        query: Search query (e.g. "dark techno", "upbeat pop").
    """
    results = rag_engine.search(query, 'audio_prompt', limit=3)
    if not results:
        return "No exact matches found in memory. Please use your own creative judgment to configure the studio."
    
    summary = "Found these successful examples from the library:\n"
    for r in results:
        summary += f"- Prompt: '{r['content']}' (Similarity: {r['similarity']:.2f})\n"
    return summary

producer_agent = CodeAgent(
    tools=[configure_studio, search_audio_library],
    model=model,
    add_base_tools=False,
    description="You are the Studio Producer. First, search the audio library. Then, you MUST use the 'configure_studio' tool to generate the configuration. Return the tool output."
)
