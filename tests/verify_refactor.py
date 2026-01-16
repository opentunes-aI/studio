import sys
import os
import asyncio
from unittest.mock import MagicMock, patch

# Add root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from acestep.api.core.config import settings
    from acestep.api.schemas import GenerationRequest
    from acestep.api.services.job_service import JobService
    from acestep.api.routers import music_router
    print("[OK] Imports successful: Modular structure exists.")
except ImportError as e:
    print(f"[ERROR] Import failed: {e}")
    sys.exit(1)

async def test_job_flow():
    print("Testing Job Submission Flow (Mocked DB)...")
    
    # Mock Billing to avoid DB calls
    with patch("acestep.api.services.billing_service.BillingService.deduct_credits") as mock_billing:
        req = GenerationRequest(
            prompt="Test Song",
            duration=15,
            user_id="test_user"
        )
        
        job = await JobService.submit_job(req)
        
        if job.status == "queued":
            print(f"[OK] Job Submitted: {job.job_id}")
        else:
            print(f"[FAIL] Job Status unexpected: {job.status}")
            sys.exit(1)

        # Mock Engine for Worker
        with patch("acestep.api.core.model_manager.manager.get_engine") as mock_engine:
            mock_pipeline = MagicMock()
            mock_pipeline.generate.return_value = ["/tmp/test.wav"]
            mock_engine.return_value = mock_pipeline
            
            # We won't run the full worker loop, but we can inspect the queue
            # Actually TASK_QUEUE is in job_service module scope in my refactor?
            # Let's check imports in job_service.py
            from acestep.api.services.job_service import TASK_QUEUE
            if TASK_QUEUE.qsize() > 0:
                 print(f"[OK] Job Enqueued in global queue ({TASK_QUEUE.qsize()} items)")
            else:
                 print("[FAIL] Queue empty after submission")

if __name__ == "__main__":
    asyncio.run(test_job_flow())
