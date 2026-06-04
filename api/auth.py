import re
import secrets
import resend
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timezone, timedelta
import os

resend.api_key = os.getenv("RESEND_API_KEY", "")

from database import get_db
from models import User, Workflow, WorkflowExecution
from core.auth import hash_password, verify_password, create_access_token, decode_token

IS_PROD = bool(os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("DATABASE_URL", "").startswith("postgresql"))

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        user_id = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter_by(id=user_id, is_active=True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class RegisterRequest(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=201)
@limiter.limit("5/minute")
def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    if len(email) > 254:
        raise HTTPException(status_code=400, detail="Email too long")
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if len(body.password) > 128:
        raise HTTPException(status_code=400, detail="Password too long")
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"access_token": create_access_token(user.id), "token_type": "bearer"}


@router.post("/login")
@limiter.limit("10/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    remember_me: bool = Query(False),
    db: Session = Depends(get_db),
):
    email = form_data.username.lower().strip()
    user = db.query(User).filter_by(email=email, is_active=True).first()
    if not user or not user.password_hash or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    expire_days = 30 if remember_me else 7
    return {"access_token": create_access_token(user.id, expire_days=expire_days), "token_type": "bearer"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name or "",
        "plan": current_user.plan,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


class ProfileUpdate(BaseModel):
    name: str


@router.patch("/profile")
def update_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.name = body.name.strip()[:100]
    db.commit()
    return {"updated": True}


PLAN_LIMITS = {
    "free":   {"runs": 100,   "workflows": 3},
    "solo":   {"runs": 2000,  "workflows": 20},
    "pro":    {"runs": 20000, "workflows": None},
    "agency": {"runs": None,  "workflows": None},
}


@router.get("/usage")
def get_usage(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    exec_count = (
        db.query(func.count(WorkflowExecution.id))
        .join(Workflow, WorkflowExecution.workflow_id == Workflow.id)
        .filter(Workflow.user_id == current_user.id, WorkflowExecution.started_at >= month_start)
        .scalar()
    ) or 0

    wf_count = (
        db.query(func.count(Workflow.id))
        .filter(Workflow.user_id == current_user.id, Workflow.is_active == True)
        .scalar()
    ) or 0

    limits = PLAN_LIMITS.get(current_user.plan, PLAN_LIMITS["free"])
    return {
        "executions_this_month": exec_count,
        "workflows_count": wf_count,
        "limits": limits,
    }


class SettingsUpdate(BaseModel):
    api_keys: dict


@router.get("/settings")
def get_settings(current_user: User = Depends(get_current_user)):
    return {"api_keys": current_user.api_keys or {}}


@router.put("/settings")
def update_settings(
    body: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.api_keys = body.api_keys
    db.commit()
    return {"saved": True}


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.put("/password")
def change_password(
    body: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.password_hash or not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    current_user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"changed": True}


class ForgotPasswordRequest(BaseModel):
    email: str


@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    user = db.query(User).filter_by(email=email, is_active=True).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()

        reset_url = f"https://weavo.run/reset-password.html?token={token}"
        if not IS_PROD:
            reset_url = f"http://localhost:8002/reset-password.html?token={token}"

        if resend.api_key:
            try:
                resend.Emails.send({
                    "from": "Weavo <noreply@weavo.run>",
                    "to": user.email,
                    "subject": "Reset your Weavo password",
                    "html": f"""
                    <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0b0b1c;color:#e2e8f0;border-radius:12px;">
                      <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient></defs>
                          <rect width="32" height="32" rx="7" fill="url(#g)"/>
                          <rect x="9" y="9" width="14" height="14" rx="3" fill="rgba(255,255,255,0.18)" stroke="white" stroke-width="2"/>
                          <line x1="3" y1="12" x2="9" y2="12" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                          <line x1="3" y1="16" x2="9" y2="16" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                          <line x1="3" y1="20" x2="9" y2="20" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                          <line x1="23" y1="16" x2="27" y2="16" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                          <path d="M25 13 L29 16 L25 19" stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span style="font-size:18px;font-weight:800;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Weavo</span>
                      </div>
                      <h2 style="color:#f1f5f9;margin:0 0 12px;font-size:20px;">Reset your password</h2>
                      <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">We received a request to reset the password for your Weavo account. Click the button below — the link expires in <strong style="color:#e2e8f0;">1 hour</strong>.</p>
                      <a href="{reset_url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Reset Password</a>
                      <p style="color:#334155;margin-top:24px;font-size:12px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
                      <hr style="border:none;border-top:1px solid #1e2a3a;margin:24px 0;"/>
                      <p style="color:#1e2a3a;font-size:11px;">© 2026 Weavo · <a href="https://weavo.run" style="color:#334155;">weavo.run</a></p>
                    </div>
                    """,
                })
            except Exception as e:
                print(f"[EMAIL ERROR] {e}")
        else:
            print(f"[DEV] Reset URL: {reset_url}")

    return {"message": "If that email is registered, a reset link has been sent."}


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, body: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    user = db.query(User).filter_by(reset_token=body.token).first()
    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if user.reset_token_expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired")
    user.password_hash = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password updated successfully"}
