import logging
import stripe
from fastapi import HTTPException
from acestep.api.core.database import get_db
from acestep.api.core.config import settings

logger = logging.getLogger("ace_step_api.billing")

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

class BillingService:
    
    @staticmethod
    def create_portal_session(user_id: str, email: str = None):
        """Creates a Stripe Portal Session for managing subscriptions"""
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(503, "Stripe not configured")

        try:
            cid = BillingService._get_customer_id(user_id, email)
            if not cid:
                raise HTTPException(404, "No billing account found")

            # 3. Create Portal Session
            portal_session = stripe.billing_portal.Session.create(
                customer=cid,
                return_url=f"{settings.APP_BASE_URL}/settings/billing"
            )
            return {"url": portal_session.url}

        except HTTPException: raise
        except Exception as e:
            logger.error(f"Portal Error: {e}")
            raise HTTPException(500, "Portal creation failed")

    @staticmethod
    def cancel_subscription(user_id: str):
        """Cancels the user's active subscription at period end"""
        supabase = get_db()
        if not supabase: return False

        # 1. Get Subscription ID
        res = supabase.table("wallets").select("stripe_subscription_id").eq("user_id", user_id).single().execute()
        sub_id = res.data.get("stripe_subscription_id")
        
        if not sub_id:
            raise HTTPException(400, "No active subscription found")

        try:
            # 2. Cancel at Period End (Standard SaaS behavior)
            stripe.Subscription.modify(
                sub_id,
                cancel_at_period_end=True
            )
            
            # 3. Update DB Status
            supabase.table("wallets").update({"subscription_status": "canceling"}).eq("user_id", user_id).execute()
            
            return {"status": "canceled", "message": "Subscription will end at the current billing cycle."}
            
        except Exception as e:
            logger.error(f"Cancel Error: {e}")
            raise HTTPException(500, f"Cancellation failed: {str(e)}")

    @staticmethod
    def create_checkout_session(user_id: str, email: str, price_id: str, is_subscription: bool = False):
        """Creates a Stripe Checkout Session for Credit Packs or Subscriptions"""
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(503, "Stripe not configured")

        try:
            mode = 'subscription' if is_subscription else 'payment'
            
            checkout_session = stripe.checkout.Session.create(
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode=mode,
                success_url=f"{settings.APP_BASE_URL}/studio?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.APP_BASE_URL}/studio?checkout=cancel",
                customer_email=email,
                metadata={
                    "user_id": user_id,
                    "type": "subscription" if is_subscription else "credit_pack",
                    "plan_id": price_id
                }
            )
            return {"url": checkout_session.url}
        except Exception as e:
            logger.error(f"Stripe Error: {e}")
            raise HTTPException(500, f"Payment init failed: {str(e)}")

    @staticmethod
    async def handle_webhook(body: bytes, sig_header: str):
        """Securely handles Stripe Webhook events"""
        if not settings.STRIPE_WEBHOOK_SECRET:
            return {"status": "ignored", "reason": "no_secret"}

        try:
            event = stripe.Webhook.construct_event(
                body, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(400, "Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(400, "Invalid signature")

        if event['type'] in ['checkout.session.completed', 'invoice.payment_succeeded']:
            # Handle both One-time and Recurring
            # Note: invoice.payment_succeeded is for recurring renewals
            
            data_obj = event['data']['object']
            
            # For invoice.payment_succeeded, meta is inside .lines or we rely on customer search?
            # Actually, checkout.session.completed sends user_id. 
            # Recurring invoices might NOT have metadata on the invoice object itself easily.
            # Strategy: Index customer_id -> user_id mapping or rely on subscription metadata.
            
            # Simplified MVP: Rely on checkout.session.completed for INITIAL subscription too.
            # For Recurring: We need to ensure subscription object has metadata.
            
            user_id = None
            metadata = data_obj.get('metadata', {})
            user_id = metadata.get('user_id')
            
            # If invoice, look deeper?
            if event['type'] == 'invoice.payment_succeeded':
                # Invoice -> Subscription -> Metadata
                # This requires fetching the subscription from Stripe if not expanded.
                try:
                    sub_id = data_obj.get('subscription')
                    if sub_id:
                        sub = stripe.Subscription.retrieve(sub_id)
                        user_id = sub.metadata.get('user_id')
                except: pass

            if user_id:
                amount_total = data_obj.get('amount_total', 0) # in cents
                
                credits_to_add = 0
                if amount_total >= 2000: credits_to_add = 3000
                elif amount_total >= 1000: credits_to_add = 1200
                elif amount_total >= 500: credits_to_add = 500
                else: credits_to_add = 100

                await BillingService.add_credits(
                    user_id=user_id, 
                    amount=credits_to_add, 
                    reason="subscription_renewal" if event['type'] == 'invoice.payment_succeeded' else "purchase",
                    metadata={"stripe_id": data_obj.get('id')}
                )
                
                # Update Subscription Status (Ref: Migration 10)
                if event['type'] == 'checkout.session.completed' and metadata.get('type') == 'subscription':
                     BillingService.update_subscription_status(user_id, 'active', stripe_sub_id=data_obj.get('subscription'))

                logger.info(f"Stripe: Added {credits_to_add} credits to {user_id}")

        return {"status": "processed"}

    @staticmethod
    async def add_credits(user_id: str, amount: int, reason: str, metadata: dict = {}):
        """Internal method to add credits transactionally"""
        supabase = get_db()
        if not supabase: return

        # Get Current
        res = supabase.table("wallets").select("balance").eq("user_id", user_id).single().execute()
        if not res.data: return # User has no wallet?
        
        current = res.data['balance']
        new_bal = current + amount
        
        # Update Wallet
        supabase.table("wallets").update({"balance": new_bal}).eq("user_id", user_id).execute()
        
        # Log Transaction
        supabase.table("transactions").insert({
            "user_id": user_id,
            "amount": amount,
            "reason": reason,
            "metadata": metadata
        }).execute()

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
    @staticmethod
    def get_history(user_id: str, limit: int = 20):
        """Fetch recent transaction history."""
        supabase = get_db()
        if not supabase: return []
        
        try:
            res = supabase.table("transactions")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Failed to fetch history: {e}")
            return []
    @staticmethod
    def _get_customer_id(user_id: str, email: str = None):
        """Helper to resolve Stripe Customer ID from User ID"""
        supabase = get_db()
        customer_id = None
        
        if supabase:
            res = supabase.table("wallets").select("stripe_subscription_id").eq("user_id", user_id).single().execute()
            if res.data and res.data.get("stripe_subscription_id"):
                try:
                    sub = stripe.Subscription.retrieve(res.data["stripe_subscription_id"])
                    customer_id = sub.customer
                except: pass

        if not customer_id and email:
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                customer_id = customers.data[0].id
        
        return customer_id

    @staticmethod
    def get_payment_methods(user_id: str, email: str = None):
        """List all payment methods for the user"""
        if not settings.STRIPE_SECRET_KEY: return []
        
        cid = BillingService._get_customer_id(user_id, email)
        if not cid: return [] 
        
        try:
            pms = stripe.PaymentMethod.list(customer=cid, type="card")
            customer = stripe.Customer.retrieve(cid)
            default_pm = customer.invoice_settings.default_payment_method
            
            return [{
                "id": pm.id,
                "brand": pm.card.brand,
                "last4": pm.card.last4,
                "exp_month": pm.card.exp_month,
                "exp_year": pm.card.exp_year,
                "is_default": pm.id == default_pm
            } for pm in pms.data]
        except Exception as e:
            logger.error(f"List PM Error: {e}")
            return []

    @staticmethod
    def create_setup_session(user_id: str, email: str):
        """Create a session to add a new payment method"""
        if not settings.STRIPE_SECRET_KEY: raise HTTPException(503, "Stripe not configured")
        
        cid = BillingService._get_customer_id(user_id, email)
        if not cid and email:
            # Create Customer if not exists
            cust = stripe.Customer.create(email=email, metadata={"user_id": user_id})
            cid = cust.id
            
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='setup',
                customer=cid,
                success_url=f"{settings.APP_BASE_URL}/studio?setup=success",
                cancel_url=f"{settings.APP_BASE_URL}/studio?setup=cancel",
            )
            return {"url": session.url}
        except Exception as e:
            logger.error(f"Setup Session Error: {e}")
            raise HTTPException(500, "Setup failed")

    @staticmethod
    def detach_payment_method(user_id: str, pm_id: str):
        """Remove a payment method"""
        cid = BillingService._get_customer_id(user_id)
        if not cid: raise HTTPException(404, "Customer not found")
        
        pms = stripe.PaymentMethod.list(customer=cid, type="card")
        
        # Check if user has active subscription
        # Logic: If Sub Active, must keep at least 1 PM.
        supabase = get_db()
        # simplified check: assume if they have Stripe Customer, they might have sub.
        # But we can check wallet status.
        is_active = False
        if supabase:
             w = supabase.table("wallets").select("subscription_status").eq("user_id", user_id).single().execute()
             if w.data and w.data.get("subscription_status") == 'active':
                 is_active = True
                 
        if is_active and len(pms.data) <= 1:
            raise HTTPException(400, "Cannot remove the last payment method while subscription is active.")

        try:
            stripe.PaymentMethod.detach(pm_id)
            return {"status": "detached"}
        except Exception as e:
            raise HTTPException(500, f"Detach failed: {str(e)}")

    @staticmethod
    def set_default_payment_method(user_id: str, pm_id: str):
        cid = BillingService._get_customer_id(user_id)
        if not cid: raise HTTPException(404, "Customer not found")
        
        try:
            stripe.Customer.modify(cid, invoice_settings={"default_payment_method": pm_id})
            return {"status": "updated"}
        except Exception as e:
            raise HTTPException(500, f"Update failed: {str(e)}")

    @staticmethod
    def update_subscription_status(user_id: str, status: str, stripe_sub_id: str = None):
        """Updates subscription status in wallet."""
        supabase = get_db()
        if not supabase: return
        
        updates = {"subscription_status": status}
        if stripe_sub_id: updates["stripe_subscription_id"] = stripe_sub_id
        
        try:
            supabase.table("wallets").update(updates).eq("user_id", user_id).execute()
        except: pass

    @staticmethod
    def get_subscription_details(user_id: str):
        """Fetch detailed subscription info including period dates"""
        if not settings.STRIPE_SECRET_KEY: return None
        
        supabase = get_db()
        if not supabase: return None
        
        try:
            res = supabase.table("wallets").select("stripe_subscription_id").eq("user_id", user_id).single().execute()
            if not res.data or not res.data.get("stripe_subscription_id"):
                return None
                
            sub_id = res.data["stripe_subscription_id"]
            sub = stripe.Subscription.retrieve(sub_id)
            
            return {
                "status": sub.status,
                "current_period_start": sub.current_period_start,
                "current_period_end": sub.current_period_end,
                "cancel_at_period_end": sub.cancel_at_period_end,
                "plan_amount": sub.plan.amount, # in cents
                "plan_interval": sub.plan.interval
            }
        except Exception as e:
            logger.error(f"Sub Details Error: {e}")
            return None
