import os
import logging
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client, ClientOptions

logger = logging.getLogger(__name__)

class RAGEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized: return
        
        # Lazy Config
        self.embedding_model_name = os.getenv("RAG_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self.model = None
        self.supabase: Optional[Client] = None
        self._ready_check_done = False
        
        logger.info("RAG Engine instantiated (Lazy Loading).")
        self._initialized = True

    def _ensure_ready(self) -> bool:
        """
        Lazy loader for heavy assets (Model) and Network (Supabase).
        """
        if self.model and self.supabase: return True
        if self._ready_check_done and not self.supabase: return False # Failed prev attempt

        try:
            if not self.model:
                logger.info(f"Loading Embedding Model: {self.embedding_model_name}...")
                self.model = SentenceTransformer(self.embedding_model_name)
                logger.info("Embedding Model Loaded.")
            
            if not self.supabase:
                url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
                key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
                
                if url and key:
                    # Set short timeout to avoid hanging
                    opts = ClientOptions(postgrest_client_timeout=5)
                    self.supabase = create_client(url, key, options=opts)
                else:
                    logger.warning("Supabase credentials missing. RAG Disabled.")
                    self._ready_check_done = True
                    return False
            
            return True
        except Exception as e:
            logger.error(f"RAG Init Failed: {e}")
            self._ready_check_done = True
            return False

    def index_item(self, content: str, type: str, metadata: Dict[str, Any] = {}) -> bool:
        """
        Generates embedding and saves to 'agent_memory'.
        type: 'audio_prompt' | 'lyrics'
        """
        if not self._ensure_ready(): return False
        
        try:
            embedding = self.model.encode(content).tolist()
            data = {
                "content": content,
                "type": type,
                "embedding": embedding,
                "metadata": metadata
            }
            self.supabase.table("agent_memory").insert(data).execute()
            logger.info(f"Indexed {type}: {content[:30]}...")
            return True
        except Exception as e:
            logger.error(f"Index Failed: {e}")
            return False

    def search(self, query: str, type_filter: str, limit: int = 3, threshold: float = 0.5) -> List[Dict]:
        """
        Uses RPC 'match_agent_memory' to find similar content.
        """
        if not self._ensure_ready(): return []

        try:
            embedding = self.model.encode(query).tolist()
            params = {
                "query_embedding": embedding,
                "match_threshold": threshold,
                "match_count": limit,
                "filter_type": type_filter
            }
            res = self.supabase.rpc("match_agent_memory", params).execute()
            return res.data
        except Exception as e:
            logger.error(f"Search Failed: {e}")
            return []

# Singleton Instance
rag_engine = RAGEngine()
