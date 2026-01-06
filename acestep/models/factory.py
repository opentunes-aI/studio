import os
from acestep.models.engine import AudioEngine
from acestep.models.wrappers.acestep_engine import ACEStepEngine

def get_audio_engine() -> AudioEngine:
    """
    Factory function to return the configured AudioEngine.
    Reads 'AUDIO_MODEL_TYPE' env var. Defaults to 'acestep'.
    """
    model_type = os.getenv("AUDIO_MODEL_TYPE", "acestep").lower()
    
    if model_type == "acestep":
        return ACEStepEngine()
    
    # Placeholder for future expansion
    # if model_type == "musicgen":
    #    return MusicGenEngine()

    raise ValueError(f"Unknown Audio Engine Type: {model_type}")
