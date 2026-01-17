from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel
from acestep.api.services.billing_service import BillingService
from typing import Optional

router = APIRouter()

class CheckoutRequest(BaseModel):
    user_id: str
    email: str
    price_id: str
    is_subscription: bool = False

class PortalRequest(BaseModel):
    user_id: str
    email: str

@router.post("/create-checkout-session")
async def create_checkout(req: CheckoutRequest):
    return BillingService.create_checkout_session(req.user_id, req.email, req.price_id, req.is_subscription)

@router.post("/create-portal-session")
async def create_portal(req: PortalRequest):
    return BillingService.create_portal_session(req.user_id, req.email)

class CancelRequest(BaseModel):
    user_id: str

@router.post("/cancel-subscription")
async def cancel_sub(req: CancelRequest):
    return BillingService.cancel_subscription(req.user_id)

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    if not stripe_signature:
        raise HTTPException(400, "Missing Signature")
    
    body = await request.body()
    return await BillingService.handle_webhook(body, stripe_signature)

@router.get("/history/{user_id}")
async def get_history(user_id: str):
    return {"history": BillingService.get_history(user_id)}

@router.get("/payment-methods/{user_id}")
async def get_pms(user_id: str, email: str = None):
    return {"methods": BillingService.get_payment_methods(user_id, email)}

class PMRequest(BaseModel):
    user_id: str
    pm_id: str

@router.post("/payment-methods/detach")
async def detach_pm(req: PMRequest):
    return BillingService.detach_payment_method(req.user_id, req.pm_id)

@router.post("/payment-methods/default")
async def default_pm(req: PMRequest):
    return BillingService.set_default_payment_method(req.user_id, req.pm_id)

@router.post("/create-setup-session")
async def create_setup(req: PortalRequest):
    return BillingService.create_setup_session(req.user_id, req.email)

@router.get("/subscription-details/{user_id}")
async def get_sub_details(user_id: str):
    return {"details": BillingService.get_subscription_details(user_id)}
