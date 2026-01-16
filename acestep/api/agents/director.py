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

import ast

def parse_llm_json(text: str) -> Optional[Dict]:
    """Robust JSON extraction from LLM output."""
    clean_text = text.strip()
    
    # Attempt 1: Direct JSON
    try: return json.loads(clean_text)
    except: pass

    # Attempt 2: Python Literal Evaluation (Handles {'key': 'value'} single quotes)
    try:
        val = ast.literal_eval(clean_text)
        if isinstance(val, dict): return val
    except: pass

    # Attempt 3: Markdown Code Block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", clean_text, re.DOTALL)
    if match:
        try: return json.loads(match.group(1))
        except: pass
        # Try literal eval on code block too
        try: 
            val = ast.literal_eval(match.group(1))
            if isinstance(val, dict): return val
        except: pass

    # Attempt 4: Fuzzy extraction of first object
    try:
        start = clean_text.find('{')
        end = clean_text.rfind('}')
        if start != -1 and end != -1:
            candidate = clean_text[start:end+1]
            try: return json.loads(candidate)
            except: pass
            try: 
                val = ast.literal_eval(candidate)
                if isinstance(val, dict): return val
            except: pass
    except: pass
            
    return None

async def run_producer(context: str):
    # Returns (name, result)
    return ("producer", await asyncio.to_thread(producer_agent.run, f"{context}\nTASK: Search library for inspiration. IF NO MATCHES, use your own knowledge. ALWAYS Configure studio parameters using the 'configure_studio' tool."))

async def run_lyricist(context: str):
    # Returns (name, result)
    return ("lyricist", await asyncio.to_thread(lyricist_agent.run, f"{context}\nTASK: Search library for rhymes/style, then Write lyrics. You MUST use the 'update_lyrics' tool to return the result."))

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
            "Rules: Default to TRUE for all unless explicitly requested otherwise (e.g. 'instrumental' -> lyrics=false).\n"
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
    elif "song" in u or "track" in u or "write" in u: 
        # If explicit request for audio creation, assume we want full package unless denied
        if plan.get('lyrics') is False and "no lyrics" not in u: plan['lyrics'] = True
        if plan.get('art') is False and "no art" not in u: plan['art'] = True
    
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

                        # Handle smolagents custom types (AgentText, etc.)
                        if not isinstance(res, (dict, str, list, tuple)) and res is not None:
                             if hasattr(res, 'to_string'): res = res.to_string()
                             elif hasattr(res, 'text'): res = res.text
                             else: res = str(res)

                        if isinstance(res, dict):
                            # Heuristic: Auto-wrap incomplete Producer outputs
                            if name == "producer" and "action" not in res and any(k in res for k in ["prompt", "genre", "mood", "bpm", "steps"]):
                                wrapped_params = res.copy()
                                if "prompt" not in wrapped_params:
                                    parts = [str(wrapped_params.get(k)) for k in ["genre", "mood", "instruments"] if k in wrapped_params]
                                    wrapped_params["prompt"] = ", ".join(parts)
                                res = {"action": "configure", "params": wrapped_params}

                            # Heuristic: Auto-wrap incomplete Lyricist outputs
                            elif name == "lyricist" and "action" not in res and any(k in res for k in ["lyrics", "content", "text"]):
                                res = {"action": "update_lyrics", "params": res}

                            valid_result = res
                            if res.get("action") == "configure":
                                p = res.get("params", {})
                                snippet = f"Configured: {str(p.get('prompt'))[:30]}..."
                            elif res.get("action") == "update_lyrics":
                                snippet = "Lyrics Drafted"
                        
                        else:
                            # Force conversion to string for any non-dict type (AgentText, etc.)
                            if not isinstance(res, str):
                                if hasattr(res, 'text'): res = res.text
                                else: res = str(res)

                            # SANITIZE: Remove Smolagents Tool Logs
                            if "Calling tools:" in res:
                                res = res.split("Calling tools:")[0].strip()
                            
                            extracted = parse_llm_json(res)
                            if extracted and isinstance(extracted, dict):
                                valid_result = extracted
                                if extracted.get("action") == "configure":
                                    p = extracted.get("params", {})
                                    snippet = f"Configured: {str(p.get('prompt'))[:30]}..."
                                elif extracted.get("action") == "update_lyrics":
                                    snippet = "Lyrics Drafted"
                            else:
                                # Fallback logic for Lyricist raw text
                                if name == "lyricist":
                                     clean_res = re.sub(r"```.*?```", "", res, flags=re.DOTALL).strip()
                                     if clean_res and len(clean_res) > 5:
                                         valid_result = {
                                            "action": "update_lyrics",
                                            "params": { "lyrics": clean_res },
                                            "fallback": True
                                         }
                                         snippet = "Lyrics Drafted (Text Mode)"
                                else:
                                    # Parsing Failed
                                    # Catch [Music Title: X] [Genre: Y] format which Qwen sometimes outputs
                                    if name == "producer":
                                        bracket_matches = re.findall(r"\[([^:]+):\s*([^\]]+)\]", res)
                                        if bracket_matches:
                                            # Convert to dict
                                            data = {k.strip().lower(): v.strip() for k, v in bracket_matches}
                                            
                                            # Map to configure_studio params
                                            params = {
                                                "title": data.get("music title") or data.get("title") or "Untitled",
                                                "prompt": data.get("genre") or data.get("style") or "Pop",
                                                "steps": 30,
                                                "duration": 60
                                            }
                                            # Append other descriptive fields to prompt
                                            desc_parts = [v for k, v in data.items() if k not in ["music title", "title", "genre", "style"]]
                                            if desc_parts:
                                                params["prompt"] += ", " + ", ".join(desc_parts)

                                            valid_result = {"action": "configure", "params": params}
                                            snippet = f"Configured (Text Fixed): {params['title']}"
                                        else:
                                            snippet = f"Error: Invalid JSON from {name}. Raw: {res[:50]}..."
                                    else:
                                        snippet = f"Error: Invalid JSON from {name}. Raw: {res[:50]}..."

                        # Log the completion
                        yield json.dumps({"type": "log", "step": name.capitalize(), "message": snippet})
                        
                        # STREAM RESULT IMMEDIATELY
                        if valid_result:
                            print(f"DEBUG: Yielding Result for {name}: {str(valid_result)[:100]}...")
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
