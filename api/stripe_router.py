import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import User
from api.auth import get_current_user

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

PLAN_PRICE_IDS = {
    "solo":   os.getenv("STRIPE_PRICE_SOLO"),
    "pro":    os.getenv("STRIPE_PRICE_PRO"),
    "agency": os.getenv("STRIPE_PRICE_AGENCY"),
}

router = APIRouter(prefix="/stripe", tags=["stripe"])


def _price_plan_map():
    return {v: k for k, v in PLAN_PRICE_IDS.items() if v}


class CheckoutRequest(BaseModel):
    plan: str


@router.post("/create-checkout-session")
def create_checkout_session(
    body: CheckoutRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Payments not configured")

    price_id = PLAN_PRICE_IDS.get(body.plan)
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan")

    base_url = str(request.base_url).rstrip("/")

    customer_id = current_user.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            metadata={"user_id": current_user.id},
        )
        customer_id = customer.id
        current_user.stripe_customer_id = customer_id
        db.commit()

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{base_url}/success.html?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{base_url}/",
        metadata={"user_id": current_user.id},
    )

    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook error")

    price_plan_map = _price_plan_map()
    etype = event.type
    obj = event.data.object

    if etype == "checkout.session.completed":
        metadata = getattr(obj, "metadata", None)
        user_id = getattr(metadata, "user_id", None) if metadata else None
        subscription_id = getattr(obj, "subscription", None)
        customer_id = getattr(obj, "customer", None)

        plan = "free"
        if subscription_id:
            sub = stripe.Subscription.retrieve(subscription_id)
            price_id = sub.items.data[0].price.id
            plan = price_plan_map.get(price_id, "free")

        if user_id:
            user = db.query(User).filter_by(id=user_id).first()
            if user:
                user.plan = plan
                user.stripe_customer_id = customer_id
                user.stripe_subscription_id = subscription_id
                db.commit()

    elif etype == "customer.subscription.deleted":
        customer_id = getattr(obj, "customer", None)
        user = db.query(User).filter_by(stripe_customer_id=customer_id).first()
        if user:
            user.plan = "free"
            user.stripe_subscription_id = None
            db.commit()

    elif etype == "customer.subscription.updated":
        price_id = obj.items.data[0].price.id
        plan = price_plan_map.get(price_id, "free")
        customer_id = getattr(obj, "customer", None)
        user = db.query(User).filter_by(stripe_customer_id=customer_id).first()
        if user:
            user.plan = plan
            user.stripe_subscription_id = obj.id
            db.commit()

    return {"received": True}


@router.get("/portal")
def customer_portal(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Payments not configured")
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No subscription found")

    base_url = str(request.base_url).rstrip("/")
    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url=f"{base_url}/",
    )
    return {"url": session.url}
