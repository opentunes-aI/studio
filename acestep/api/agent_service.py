from smolagents import CodeAgent, LiteLLMModel, tool
from typing import Optional, Dict, Any, List
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

import urllib.parse

@tool
def update_lyrics(content: str) -> Dict[str, Any]:
    """
    Updates the studio lyric sheet.
    Args:
        content: The complete lyrics. MUST use structural tags like [Verse], [Chorus], [Bridge].
    """
    return {
        "action": "update_lyrics",
        "params": { "lyrics": content }
    }

@tool
def generate_cover_art(description: str) -> Dict[str, Any]:
    """
    Generates a cover image URL.
    Args:
        description: A detailed visual description (e.g. "Cyberpunk city, neon lights, digital art").
    """
    encoded = urllib.parse.quote(description)
    # Using Pollinations.ai for instant free generation
    url = f"https://image.pollinations.ai/prompt/{encoded}"
    return {
        "action": "generate_cover_art",
        "params": { "image_url": url, "description": description }
    }

# 2. Check for Ollama
# We assume localhost:11434 is running.
OLLAMA_URL = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")

model = LiteLLMModel(
    model_id="ollama/qwen2.5:3b",
    api_base=OLLAMA_URL
)

producer_agent = CodeAgent(
    tools=[configure_studio, update_lyrics, generate_cover_art],
    model=model,
    add_base_tools=False,
    additional_authorized_imports=["random"]
)

critic_agent = CodeAgent(
    tools=[],
    model=model,
    add_base_tools=False
)

import re
import json

def extract_json_from_text(text: str) -> Optional[Dict]:
    """Helper to extract JSON from verbose LLM output."""
    try:
        # 1. Try finding a JSON code block
        match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        
        # 2. Try finding the raw JSON object
        # Find first { and last }
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            candidate = text[start:end+1]
            return json.loads(candidate)
    except:
        pass
    return None

def process_user_intent(user_input: str, history: List[Dict[str, str]] = []):
    """
    Orchestrates the Producer and Critic agents.
    """
    try:
        # Build Context
        context_str = ""
        if history:
            relevant = [m for m in history if m.get('role') in ['user', 'agent']]
            context_str = "PREVIOUS CONVERSATION:\n" + "\n".join([f"{m.get('role','USER').upper()}: {str(m.get('content',''))[:200]}" for m in relevant[-6:]]) + "\n\n"

        # 1. PLAN PHASE
        plan_instruction = (
            f"{context_str}"
            f"USER REQUEST: '{user_input}'\n\n"
            "TASK: Analyze the USER REQUEST. Return a JSON object identifying needed agents.\n"
            "RULES:\n"
            "- 'music': True if user wants a song, track, beat, or specific parameters.\n"
            "- 'lyrics': True if user mentions lyrics, words, or a subject to write about.\n"
            "- 'art': True if user mentions cover art, image, or visuals.\n"
            "FORMAT: { \"music\": bool, \"lyrics\": bool, \"art\": bool }\n"
            "OUTPUT: JSON ONLY."
        )
        print(f"Planning for: {user_input}")
        # Re-use producer model for planning (it's smart enough)
        plan_raw = producer_agent.run(plan_instruction)
        plan = extract_json_from_text(str(plan_raw))
        if not plan:
            print(f"Plan failed, defaulting to all. Raw: {plan_raw}")
            plan = {"music": True, "lyrics": True, "art": True}
        
        # HEURISTIC OVERRIDE (Hybrid Intelligence)
        # 3B models sometimes miss obvious intents. We force-enable based on keywords.
        u = user_input.lower()
        if any(w in u for w in ['song', 'track', 'beat', 'music', 'bpm', 'tempo', 'configure']):
            plan['music'] = True
        if any(w in u for w in ['lyrics', 'words', 'verse', 'chorus', 'write']):
            plan['lyrics'] = True
        if any(w in u for w in ['art', 'cover', 'image', 'picture', 'draw', 'visual']):
            plan['art'] = True

        print(f"Plan (Final): {plan}")

        results = []

        # 2. EXECUTE PHASE (Sequential)
        
        # A. Music Config
        if plan.get('music'):
            print(">>> Running Music Config")
            res = producer_agent.run(
                f"{context_str}USER: {user_input}\nTASK: Configure the studio settings (prompt, steps, cfg, duration). Call 'configure_studio'. Return the result."
            )
            if isinstance(res, str): res = extract_json_from_text(res) or {"message": res}
            results.append(res)

            # Critic Check (Only for music)
            if res and isinstance(res, dict) and res.get("action") == "configure":
                critique = critic_agent.run(f"Critique this music config: {res['params']}")
                if "APPROVED" not in str(critique).upper():
                    results.append({"action": "critique_warning", "message": f"⚠️ Critic Warning: {str(critique)}"})

        # B. Lyrics
        if plan.get('lyrics'):
            print(">>> Running Lyrics")
            res = producer_agent.run(
                f"{context_str}USER: {user_input}\nTASK: Write lyrics for this song. Call 'update_lyrics'. Return the result."
            )
            if isinstance(res, str): res = extract_json_from_text(res) or {"message": res}
            results.append(res)

        # C. Art
        if plan.get('art'):
            print(">>> Running Art")
            res = producer_agent.run(
                f"{context_str}USER: {user_input}\nTASK: Generate cover art. Call 'generate_cover_art'. Return the result."
            )
            if isinstance(res, str): res = extract_json_from_text(res) or {"message": res}
            results.append(res)
            
        return {"result": results}

    except Exception as e:
        print(f"Agent Execution Error: {e}")
        return {
            "action": "error", 
            "message": f"Agent Error: {str(e)}",
            "fallback": {"prompt": user_input} 
        }
