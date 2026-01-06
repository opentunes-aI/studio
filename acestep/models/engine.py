from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class AudioEngine(ABC):
    @abstractmethod
    def load_model(self, checkpoint_path: Optional[str] = None):
        """Loads the model weights into memory."""
        pass

    @abstractmethod
    def generate(self, params: Dict[str, Any]) -> List[str]:
        """
        Generates audio based on parameters.
        Returns: List of output file paths.
        """
        pass
