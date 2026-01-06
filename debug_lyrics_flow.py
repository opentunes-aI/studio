
import os
import asyncio
from acestep.api.agents.lyricist import lyricist_agent

async def test_lyricist():
    print("Testing Lyricist Agent...")
    prompt = (
        "Write lyrics for a heavy metal song about dragons. "
        "Task: Search library (optional) then Write lyrics. "
        "MUST use 'update_lyrics' tool."
    )
    
    try:
        # Run synchronous agent in thread
        res = await asyncio.to_thread(lyricist_agent.run, prompt)
        
        print("\n--- RAW RESULT ---")
        print(f"Type: {type(res)}")
        print(f"Value: {res}")
        
        print("\n--- ATTRIBUTES ---")
        if hasattr(res, 'to_string'):
             print(f"to_string(): {res.to_string()}")
        if hasattr(res, 'content'):
             print(f"content: {res.content}")
             
    except Exception as e:
        print(f"\nERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_lyricist())
