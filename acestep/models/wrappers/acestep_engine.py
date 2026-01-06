import logging
import os
from typing import Dict, Any, List, Optional
from acestep.models.engine import AudioEngine
from acestep.pipeline_ace_step import ACEStepPipeline

logger = logging.getLogger(__name__)

class ACEStepEngine(AudioEngine):
    def __init__(self):
        self.pipeline = None

    def load_model(self, checkpoint_path: Optional[str] = None):
        if self.pipeline is not None:
            return
        
        logger.info(f"Loading ACE-Step Engine from {checkpoint_path}...")
        try:
            self.pipeline = ACEStepPipeline(
                checkpoint_dir=checkpoint_path,
                dtype="bfloat16",  
                torch_compile=False,
                cpu_offload=True 
            )
            # Eager load
            self.pipeline.load_checkpoint(self.pipeline.checkpoint_dir)
            logger.info("ACE-Step Engine Ready.")
        except Exception as e:
            logger.error(f"Failed to load ACE-Step: {e}")
            raise e

    def generate(self, params: Dict[str, Any]) -> List[str]:
        if not self.pipeline:
            raise RuntimeError("Model not loaded.")

        # Extract normalized params
        prompt = params.get("prompt", "")
        lyrics = params.get("lyrics", "")
        duration = float(params.get("duration", 30.0)) # Ensure float
        steps = int(params.get("steps", 50))
        cfg_scale = float(params.get("cfg_scale", 4.5))
        seed = params.get("seed", -1)
        
        # ACE-Step Specifics
        # Default to neutral/safe values for specialized args
        logger.info(f"Generating with ACE-Step: {prompt[:50]}...")
        
        # Invoke Pipeline __call__
        # ACEStepPipeline returns List[str] (paths)
        output_paths = self.pipeline(
            prompt=prompt,
            lyrics=lyrics if lyrics else None,
            audio_duration=duration,
            infer_step=steps,
            guidance_scale=cfg_scale,
            manual_seeds=seed if seed != -1 else None,
            # Pass through any extra kwargs if they exist in params
            **{k: v for k, v in params.items() if k not in ["prompt", "lyrics", "duration", "steps", "cfg_scale", "seed"]}
        )
        
        return output_paths
