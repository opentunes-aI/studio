from smolagents import CodeAgent, LiteLLMModel, tool
from typing import Dict, Any, Union, List
from acestep.api.rag import rag_engine
import os

OLLAMA_URL = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")
AGENT_MODEL = os.getenv("AGENT_MODEL_ID", "ollama/qwen2.5:3b")
model = LiteLLMModel(model_id=AGENT_MODEL, api_base=OLLAMA_URL)

@tool
def update_lyrics(content: Union[str, List[str]]) -> Dict[str, Any]:
    """
    Updates the studio lyrics field.
    
    Args:
        content: The complete lyrics as a single string. If you have multiple lines, join them with newlines.
    """
    # Defensive handling in the tool itself
    final_text = content
    if isinstance(content, list):
        final_text = "\n".join(str(x) for x in content)
    elif not isinstance(content, str):
        final_text = str(content)

    return {
        "action": "update_lyrics",
        "params": { "lyrics": final_text }
    }

@tool
def search_lyrics_library(query: str) -> str:
    """
    Searches the Agent Memory for previous successful lyrics.

    Args:
        query: Search query for lyric style/content.
    """
    results = rag_engine.search(query, 'lyrics', limit=3)
    if not results:
        return "No relevant lyric examples found in memory."
    
    summary = "Found these successful lyric snippets:\n"
    for r in results:
        summary += f"- ...{r['content'][:200]}... (Similarity: {r['similarity']:.2f})\n"
    return summary

lyricist_agent = CodeAgent(
    tools=[update_lyrics, search_lyrics_library],
    model=model,
    add_base_tools=False,
    description="You are a professional Songwriter. First, search for inspiration. Then, write the lyrics. Finally, you MUST use the 'update_lyrics' tool to save your work. Pass the lyrics as a simple string."
)
