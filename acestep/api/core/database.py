import logging
from supabase import create_client, Client
from acestep.api.core.config import settings

logger = logging.getLogger("ace_step_api.db")

class SupabaseManager:
    _instance: Client | None = None

    @classmethod
    def get_client(cls) -> Client | None:
        if cls._instance:
            return cls._instance
            
        if not settings.is_cloud_enabled:
            logger.warning("Supabase credentials missing. Cloud features disabled.")
            return None
            
        try:
            # Prefer Service Key for backend operations if available
            key = settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_ANON_KEY
            url = settings.SUPABASE_URL
            
            cls._instance = create_client(url, key)
            logger.info("Supabase Client Initialized.")
            return cls._instance
        except Exception as e:
            logger.error(f"Failed to initialize Supabase: {e}")
            return None

def get_db() -> Client | None:
    return SupabaseManager.get_client()
