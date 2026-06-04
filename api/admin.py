import os
import secrets
import resend
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta

from database import get_db
from models import User
from core.auth import hash_password

resend.api_key = os.getenv("RESEND_API_KEY", "")
IS_PROD = bool(os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("DATABASE_URL", "").startswith("postgresql"))

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "")


def verify_admin(x_admin_secret: str = Header(...)):
    if not ADMIN_SECRET or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin secret")


class UserEmailRequest(BaseModel):
    email: str


def _send_email(to: str, subject: str, html: str):
    if resend.api_key:
        try:
            resend.Emails.send({
                "from": "Weavo Security <noreply@weavo.run>",
                "to": to,
                "subject": subject,
                "html": html,
            })
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")


@router.post("/suspend")
def suspend_user(
    body: UserEmailRequest,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    user = db.query(User).filter_by(email=body.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()

    _send_email(
        to=user.email,
        subject="Your Weavo account has been temporarily suspended",
        html=f"""
        <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0b0b1c;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#f87171;margin:0 0 16px;">Account Suspended</h2>
          <p style="color:#94a3b8;line-height:1.6;margin-bottom:16px;">
            Your Weavo account (<strong style="color:#e2e8f0;">{user.email}</strong>) has been temporarily suspended
            due to suspicious activity or a security concern.
          </p>
          <p style="color:#94a3b8;line-height:1.6;margin-bottom:24px;">
            If you believe this was a mistake or if your account was compromised,
            please reply to this email at <a href="mailto:support@weavo.run" style="color:#818cf8;">support@weavo.run</a>
            and we'll restore access after verification.
          </p>
          <hr style="border:none;border-top:1px solid #1e2a3a;margin:24px 0;"/>
          <p style="color:#334155;font-size:12px;">© 2026 Weavo · weavo.run</p>
        </div>
        """,
    )

    return {"ok": True, "message": f"User {user.email} suspended. Email sent."}


@router.post("/activate")
def activate_user(
    body: UserEmailRequest,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    user = db.query(User).filter_by(email=body.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()

    _send_email(
        to=user.email,
        subject="Your Weavo account has been reactivated",
        html=f"""
        <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0b0b1c;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#4ade80;margin:0 0 16px;">Account Reactivated</h2>
          <p style="color:#94a3b8;line-height:1.6;margin-bottom:24px;">
            Your Weavo account (<strong style="color:#e2e8f0;">{user.email}</strong>) has been reactivated.
            You can now log in at <a href="https://weavo.run" style="color:#818cf8;">weavo.run</a>.
          </p>
          <p style="color:#94a3b8;line-height:1.6;">
            If you didn't request this or have any concerns, contact us at
            <a href="mailto:support@weavo.run" style="color:#818cf8;">support@weavo.run</a>.
          </p>
          <hr style="border:none;border-top:1px solid #1e2a3a;margin:24px 0;"/>
          <p style="color:#334155;font-size:12px;">© 2026 Weavo · weavo.run</p>
        </div>
        """,
    )

    return {"ok": True, "message": f"User {user.email} activated. Email sent."}


@router.post("/force-reset")
def force_reset(
    body: UserEmailRequest,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    user = db.query(User).filter_by(email=body.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    user.is_active = True
    db.commit()

    reset_url = f"https://weavo.run/reset-password.html?token={token}"
    if not IS_PROD:
        reset_url = f"http://localhost:8002/reset-password.html?token={token}"

    _send_email(
        to=user.email,
        subject="Reset your Weavo password — security action required",
        html=f"""
        <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0b0b1c;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#f1f5f9;margin:0 0 16px;">Password Reset Required</h2>
          <p style="color:#94a3b8;line-height:1.6;margin-bottom:16px;">
            For your security, we've initiated a mandatory password reset for your Weavo account
            (<strong style="color:#e2e8f0;">{user.email}</strong>).
          </p>
          <p style="color:#94a3b8;line-height:1.6;margin-bottom:24px;">
            This link expires in <strong style="color:#e2e8f0;">24 hours</strong>.
          </p>
          <a href="{reset_url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Set New Password</a>
          <p style="color:#475569;margin-top:24px;font-size:12px;line-height:1.6;">
            If you have questions, contact us at <a href="mailto:support@weavo.run" style="color:#818cf8;">support@weavo.run</a>.
          </p>
          <hr style="border:none;border-top:1px solid #1e2a3a;margin:24px 0;"/>
          <p style="color:#334155;font-size:12px;">© 2026 Weavo · weavo.run</p>
        </div>
        """,
    )

    return {"ok": True, "message": f"Password reset sent to {user.email}.", "reset_url": reset_url if not IS_PROD else None}


@router.get("/user/{email}")
def get_user_info(
    email: str,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    user = db.query(User).filter_by(email=email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "plan": user.plan,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "has_stripe": bool(user.stripe_customer_id),
    }
