
import os
import sys
import logging
import traceback

# Setup logging to file
logging.basicConfig(filename='debug_startup_error.log', level=logging.DEBUG)
logger = logging.getLogger("debug_startup")

print("Starting debug startup...")
logger.info("Starting debug startup...")

try:
    # Set env vars
    os.environ["ACE_CHECKPOINT_PATH"] = r"G:\My Drive\models"
    
    from acestep.api.dependencies import manager
    print("Dependencies imported.")
    
    print("Loading model... (this may take time)")
    manager.load_model(checkpoint_path=os.environ["ACE_CHECKPOINT_PATH"])
    print("Model loaded successfully!")
    logger.info("Model loaded successfully!")

except Exception as e:
    print(f"FAILED: {e}")
    logger.error(f"Startup Failed: {e}")
    logger.error(traceback.format_exc())
    with open("debug_startup_crash.txt", "w") as f:
        f.write(f"Error: {e}\n\nTraceback:\n{traceback.format_exc()}")
