import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User, UserPlan

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/payments", tags=["payments"])


class CheckoutRequest(BaseModel):
    plan: str  # "monthly" or "lifetime"


@router.post("/checkout")
def create_checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    price_id = (
        settings.STRIPE_MONTHLY_PRICE_ID
        if payload.plan == "monthly"
        else settings.STRIPE_LIFETIME_PRICE_ID
    )
    if not price_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    if not current_user.stripe_customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            name=current_user.name,
            metadata={"user_id": str(current_user.id)},
        )
        current_user.stripe_customer_id = customer.id
        db.commit()

    mode = "subscription" if payload.plan == "monthly" else "payment"
    session = stripe.checkout.Session.create(
        customer=current_user.stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode=mode,
        success_url=f"{settings.FRONTEND_URL}/dashboard?payment=success",
        cancel_url=f"{settings.FRONTEND_URL}/pricing?payment=cancelled",
        metadata={"user_id": str(current_user.id)},
    )
    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    if event["type"] in ("checkout.session.completed", "invoice.paid"):
        session_obj = event["data"]["object"]
        user_id = session_obj.get("metadata", {}).get("user_id")
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.plan = UserPlan.PREMIUM
                if session_obj.get("subscription"):
                    user.stripe_subscription_id = session_obj["subscription"]
                db.commit()

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        user = db.query(User).filter(User.stripe_subscription_id == sub["id"]).first()
        if user:
            user.plan = UserPlan.FREE
            user.stripe_subscription_id = None
            db.commit()

    return {"status": "ok"}


@router.get("/portal")
def billing_portal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No billing account found")

    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/dashboard/settings",
    )
    return {"portal_url": session.url}
