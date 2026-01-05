from smolagents import CodeAgent, LiteLLMModel
from typing import List, Dict, Any, Optional
import asyncio
import json
import re
import os
from pydantic import BaseModel, ValidationError

# Import Specialists
from .producer import producer_agent
from .lyricist import lyricist_agent
from .visualizer import visualizer_agent
from .critic import critic_agent

OLLAMA_URL = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")
AGENT_MODEL = os.getenv("AGENT_MODEL_ID", "ollama/qwen2.5:3b")
model = LiteLLMModel(model_id=AGENT_MODEL, api_base=OLLAMA_URL)

director_agent = CodeAgent(
    tools=[], 
    model=model,
    add_base_tools=False,
    description="You are the Studio Director. You analyze user requests and delegate tasks."
)

class AgentPlan(BaseModel):
    music: bool
    lyrics: bool
    art: bool

def parse_llm_json(text: str) -> Optional[Dict]:
    """Robust JSON extraction from LLM output."""
    clean_text = text.strip()
    
    # Attempt 1: Direct JSON
    try: return json.loads(clean_text)
    except: pass

    # Attempt 2: Markdown Code Block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", clean_text, re.DOTALL)
    if match:
        try: return json.loads(match.group(1))
        except: pass

    # Attempt 3: Fuzzy extraction of first object
    try:
        start = clean_text.find('{')
        end = clean_text.rfind('}')
        if start != -1 and end != -1:
            return json.loads(clean_text[start:end+1])
    except: pass
            
    return None

async def run_producer(context: str):
    # Returns (name, result)
    return ("producer", await asyncio.to_thread(producer_agent.run, f"{context}\nTASK: Search library for inspiration. IF NO MATCHES, use your own knowledge. ALWAYS Configure studio parameters and Return JSON."))

async def run_lyricist(context: str):
    # Returns (name, result)
    return ("lyricist", await asyncio.to_thread(lyricist_agent.run, f"{context}\nTASK: Search library for rhymes/style, then Write lyrics. Return JSON."))

async def process_user_intent(user_input: str, history: List[Dict[str, str]] = []):
    """
    Generator that yields status updates JSON strings.
    """
    # Yield logs to Frontend
    yield json.dumps({"type": "log", "step": "Director", "message": f"Analyzing request: {user_input[:50]}..."})
    await asyncio.sleep(0.1) # Force flush
    
    # Context Builder
    context_str = f"USER REQUEST: '{user_input}'\n"
    
    # 1. PLAN
    plan = {"music": True, "lyrics": True, "art": True} 
    try:
        yield json.dumps({"type": "log", "step": "Director", "message": "Planning tasks..."})
        await asyncio.sleep(0.1)
        plan_query = (
            f"{context_str}\n"
            "Analyze intent. Return JSON: { \"music\": bool, \"lyrics\": bool, \"art\": bool }\n"
            "Example: User='Make a song about love' -> {\"music\": true, \"lyrics\": true, \"art\": true}"
        )
        plan_raw = await asyncio.to_thread(director_agent.run, plan_query)
        extracted = parse_llm_json(str(plan_raw))
        if extracted:
            try:
                # Validate with Pydantic
                validated = AgentPlan(**extracted)
                plan = validated.model_dump()
            except ValidationError:
                # Soft fallback if keys missing
                plan.update(extracted)
        
        yield json.dumps({"type": "plan", "plan": plan})
    except Exception as e:
        yield json.dumps({"type": "error", "message": f"Planning failed: {e}"})

    # Heuristic Overrides
    # Heuristic Overrides
    u = user_input.lower()
    if "instrumental" in u: plan['lyrics'] = False
    
    # Failsafe: If user asked to create something, assume music is needed
    if any(k in u for k in ["song", "track", "music", "beat", "make", "create"]):
        if not plan.get('music'): plan['music'] = True
    
    # 2. PARALLEL EXECUTION
    tasks = []
    if plan.get('music'): 
        yield json.dumps({"type": "log", "step": "Producer", "message": "Searching Audio Library (RAG)..."})
        tasks.append(asyncio.create_task(run_producer(context_str)))
    
    if plan.get('lyrics'): 
        yield json.dumps({"type": "log", "step": "Lyricist", "message": "Searching Lyrics Library (RAG)..."})
        tasks.append(asyncio.create_task(run_lyricist(context_str)))
        
    outputs = {}
    if tasks:
        try:
            pending = tasks
            while pending:
                done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
                for t in done:
                    try:
                        name, res = t.result()
                        outputs[name] = res
                        
                        snippet = "Done"
                        valid_result = None
                        
                        # Unwrap tuple/list if necessary (smolagents sometimes returns (result, log))
                        if isinstance(res, (tuple, list)) and len(res) > 0:
                            res = res[0]

                        if isinstance(res, dict):
                            valid_result = res
                            if res.get("action") == "configure":
                                p = res.get("params", {})
                                snippet = f"Configured: {str(p.get('prompt'))[:30]}..."
                            elif res.get("action") == "update_lyrics":
                                snippet = "Lyrics Drafted"
                        
                        elif isinstance(res, str):
                            extracted = parse_llm_json(res)
                            if extracted:
                                valid_result = extracted
                                if extracted.get("action") == "configure":
                                    p = extracted.get("params", {})
                                    snippet = f"Configured: {str(p.get('prompt'))[:30]}..."
                                elif extracted.get("action") == "update_lyrics":
                                    snippet = "Lyrics Drafted"
                            else:
                                # Fallback logic for Lyricist raw text
                                if name == "lyricist" and ("[" in res or len(res) > 50):
                                     valid_result = {
                                        "action": "update_lyrics",
                                        "params": { "lyrics": res },
                                        "fallback": True
                                     }
                                     snippet = "Lyrics Drafted (Text Mode)"
                                else:
                                    # Parsing Failed
                                    snippet = f"Error: Invalid JSON from {name}. Raw: {res[:50]}..."
                        else:
                             snippet = f"Error: {name} returned unknown type: {type(res)}"

                        # Log the completion
                        yield json.dumps({"type": "log", "step": name.capitalize(), "message": snippet})
                        
                        # STREAM RESULT IMMEDIATELY
                        if valid_result:
                            yield json.dumps({"type": "result", "data": [valid_result]})
                            
                        # Visual Indicator that others are working
                        if pending:
                             remaining = [t.get_name() for t in pending] # Note: requires named tasks or logic inference
                             yield json.dumps({"type": "log", "step": "Director", "message": "Waiting for other agents..."})

                    except Exception as task_err:
                        yield json.dumps({"type": "log", "step": "Director", "message": f"Task Failed: {task_err}"})
        except Exception as e:
            yield json.dumps({"type": "error", "message": f"Execution Loop Failed: {e}"})

    # Flatten results for Critic (Keep strictly for internal logic, do NOT yield again)
    producer_out = outputs.get("producer")
    if isinstance(producer_out, str): producer_out = parse_llm_json(producer_out)
    
    lyricist_out = outputs.get("lyricist")
    if isinstance(lyricist_out, str):
        extracted_lyrics = parse_llm_json(lyricist_out)
        if extracted_lyrics: lyricist_out = extracted_lyrics
        # Fallback handled in loop above, but we need object for Critic
        elif "[" in lyricist_out or len(lyricist_out) > 50:
             lyricist_out = { "action": "update_lyrics", "params": { "lyrics": lyricist_out } }

    results = [] # Reset, we streamed them already


    # 3. CRITIC
    if producer_out and lyricist_out:
        yield json.dumps({"type": "log", "step": "Critic", "message": "Reviewing coherence..."})
        critique_prompt = (
            f"Producer Config: {producer_out}\n"
            f"Lyrics: {lyricist_out}\n"
            "TASK: Check if BPM/Mood matches Lyrics. If consistent, output ONLY the word 'APPROVED'. If inconsistent, explain why in 1 sentence."
        )
        critique = await asyncio.to_thread(critic_agent.run, critique_prompt)
        if "APPROVED" not in str(critique).upper():
             yield json.dumps({"type": "log", "step": "Critic", "message": f"Warning: {str(critique)[:100]}..."})
             results.append({"action": "warning", "message": str(critique)})
        else:
             yield json.dumps({"type": "log", "step": "Critic", "message": "Plan Approved ✅"})

    # 4. VISUALIZER
    if plan.get('art'):
        yield json.dumps({"type": "log", "step": "Visualizer", "message": "Generating Cover Art..."})
        viz_out = await asyncio.to_thread(visualizer_agent.run, f"{context_str}\nTASK: Generate Cover Art.")
        if isinstance(viz_out, str): viz_out = parse_llm_json(viz_out)
        if viz_out: results.append(viz_out)
        yield json.dumps({"type": "log", "step": "Visualizer", "message": "Cover Art Ready 🎨"})

    yield json.dumps({"type": "result", "data": results})
