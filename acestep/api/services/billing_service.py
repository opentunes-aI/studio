import logging
from fastapi import HTTPException
from acestep.api.core.database import get_db

logger = logging.getLogger("ace_step_api.billing")

class BillingService:
    @staticmethod
    def deduct_credits(user_id: str, cost: int, job_id: str, task: str):
        supabase = get_db()
        if not supabase:
            # If no DB, we skip billing (Local Mode)
            # Or should we enforce it? 
            # Current logic: "If supabase:"
            return

        try:
            # Check Balance
            wallet_res = supabase.table("wallets").select("balance").eq("user_id", user_id).single().execute()
            
            if wallet_res.data:
                balance = wallet_res.data.get("balance", 0)
                
                if balance < cost:
                    raise HTTPException(status_code=402, detail=f"Insufficient credits ({balance} < {cost}). Please top up.")
                
                # Deduct
                new_bal = balance - cost
                supabase.table("wallets").update({"balance": new_bal}).eq("user_id", user_id).execute()
                
                # Transaction Log
                supabase.table("transactions").insert({
                    "user_id": user_id,
                    "amount": -cost,
                    "reason": "generation",
                    "metadata": {"job_id": job_id, "task": task}
                }).execute()
                
                logger.info(f"User {user_id} spent {cost} credits. New Balance: {new_bal}")
                
        except HTTPException:
            raise
        except Exception as e:
            # For Studio Refactor stability: Log error but allow generation if billing fails
            logger.error(f"Billing System Error (Non-blocking): {e}")
            # raise HTTPException(status_code=500, detail=f"Billing failed: {e}")
            return
