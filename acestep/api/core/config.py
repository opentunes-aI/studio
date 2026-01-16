import os
from pathlib import Path
from dotenv import load_dotenv

# Load Envs (Try User's Studio config first)
# Assuming run from root "Opentunes/studio"
STUDIO_ENV = Path("acestep_studio/.env.local")
ROOT_ENV = Path(".env")

if STUDIO_ENV.exists():
    load_dotenv(STUDIO_ENV)
else:
    load_dotenv(ROOT_ENV)

class Settings:
    # API Config
    API_TITLE: str = "Opentunes Studio API"
    API_VERSION: str = "2.0.0"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 7866))
    
    # Paths
    ACE_CHECKPOINT_PATH: str = os.getenv("ACE_CHECKPOINT_PATH", "")
    OUTPUT_DIR: str = os.getenv("ACE_OUTPUT_DIR", "./outputs").strip()
    
    # External Services
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Supabase (Cloud)
    SUPABASE_URL: str | None = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    SUPABASE_ANON_KEY: str | None = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    @property
    def is_cloud_enabled(self) -> bool:
        return bool(self.SUPABASE_URL and (self.SUPABASE_ANON_KEY or self.SUPABASE_SERVICE_KEY))

settings = Settings()

# Ensure Output Dir
if not os.path.exists(settings.OUTPUT_DIR):
    os.makedirs(settings.OUTPUT_DIR)
