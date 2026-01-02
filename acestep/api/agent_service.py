from smolagents import CodeAgent, LiteLLMModel, tool
from typing import Optional, Dict, Any
import os

# 1. Define Tools
@tool
def configure_studio(
    prompt: str,
    steps: int,
    cfg_scale: float,
    duration: float,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Configures the music studio with specific parameters.
    Args:
        prompt: The text prompt for generation. Be descriptive providing genre, mood, instrumentation.
        steps: Inference steps (20-100). Higher = better quality but slower. Standard is 50.
        cfg_scale: Guidance scale (3.0-20.0). Higher = follows prompt strictly. Creative is ~7.0. Strict is ~15.0.
        duration: Length in seconds (10-300).
        seed: Random seed (optional).
    """
    return {
        "action": "configure",
        "params": {
            "prompt": prompt,
            "steps": steps,
            "cfg_scale": cfg_scale,
            "duration": duration,
            "seed": seed
        }
    }

# 2. Check for Ollama
# We assume localhost:11434 is running.
OLLAMA_URL = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")

model = LiteLLMModel(
    model_id="ollama/qwen2.5:3b",
    api_base=OLLAMA_URL
)

producer_agent = CodeAgent(
    tools=[configure_studio],
    model=model,
    add_base_tools=False,
    additional_authorized_imports=["random"]
)

def process_user_intent(user_input: str):
    """
    Takes natural language input and returns a configuration dictionary.
    """
    try:
        instruction = (
            f"USER REQUEST: '{user_input}'\n\n"
            "TASK: You are a Creative AI Producer. Configure the music studio for the user.\n"
            "CRITICAL RULES:\n"
            "1. REWRITE THE PROMPT: You MUST creatively expand the user's request. NEVER copy the user's input directly.\n"
            "   - BAD: prompt='Jazz'\n"
            "   - GOOD: prompt='Smoky late-night jazz club, saxophone melody, brushed snare drums, upright bass, warm atmosphere, 90bpm'\n"
            "2. CHOOSE PARAMETERS: Optimize Steps and CFG based on genre complexity.\n"
            "3. MANDATORY TOOL CALL: You MUST call 'configure_studio'.\n"
            "4. FINAL ANSWER: You must return the EXACT JSON dictionary returned by 'configure_studio' as your final answer. Do not write any text summary.\n"
        )
        # Agent runs and returns the output of the last tool call
        print(f"Agent Processing: {user_input}") 
        response = producer_agent.run(instruction)
        print(f"Agent Response: {response}")
        return response
    except Exception as e:
        print(f"Agent Execution Error: {e}")
        # Fallback
        return {
            "action": "error", 
            "message": str(e),
            "fallback": {"prompt": user_input} 
        }
