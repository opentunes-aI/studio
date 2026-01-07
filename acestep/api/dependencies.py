
import logging
from acestep.models.factory import get_audio_engine

logger = logging.getLogger("ace_step_api")

class ModelManager:
    _instance = None
    engine = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
        return cls._instance

    def load_model(self, checkpoint_path=None):
        if self.engine is not None:
            logger.info("Model already loaded.")
            return

        logger.info(f"Initializing Audio Engine...")
        try:
            self.engine = get_audio_engine()
            self.engine.load_model(checkpoint_path)
            logger.info("Audio Engine initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise e

    def get_engine(self):
        if self.engine is None:
            logger.info("Lazy loading model triggered...")
            import os
            checkpoint = os.getenv("ACE_CHECKPOINT_PATH", "")
            self.load_model(checkpoint)
        return self.engine

    def get_pipeline(self):
        return self.get_engine().pipeline

# Singleton instance
manager = ModelManager()
