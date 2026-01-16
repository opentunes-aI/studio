import logging
import os
from acestep.models.factory import get_audio_engine
from acestep.api.core.config import settings

logger = logging.getLogger("ace_step_api.model")

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
            # If checkpoint path not provided, use Env
            ckpt = checkpoint_path or settings.ACE_CHECKPOINT_PATH
            self.engine.load_model(ckpt)
            logger.info("Audio Engine initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise e

    def get_engine(self):
        if self.engine is None:
            logger.info("Lazy loading model triggered...")
            self.load_model()
        return self.engine

    def get_pipeline(self):
        return self.get_engine().pipeline

# Singleton instance
manager = ModelManager()
