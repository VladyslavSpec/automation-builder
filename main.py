from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os
from pathlib import Path
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

from database import engine, Base, get_db
from models import Workflow, WorkflowExecution, NewsletterSubscriber
from pydantic import BaseModel, EmailStr
from api.workflows import router as workflows_router
from api.executions import router as executions_router
from api.auth import router as auth_router
from api.stripe_router import router as stripe_router
from api.admin import router as admin_router
from api.chat import router as chat_router
from core.engine import NODE_REGISTRY

Base.metadata.create_all(bind=engine)

# Add missing columns if upgrading from older schema
from sqlalchemy import text
with engine.connect() as _conn:
    _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR;"))
    _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"))
    _conn.commit()

try:
    with engine.connect() as _conn2:
        _conn2.execute(text("ALTER TABLE users ADD COLUMN api_keys JSON;"))
        _conn2.commit()
except Exception:
    pass

try:
    with engine.connect() as _conn3:
        _conn3.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR;"))
        _conn3.commit()
except Exception:
    pass

try:
    with engine.connect() as _conn4:
        _conn4.execute(text("ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR;"))
        _conn4.execute(text("ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR;"))
        _conn4.commit()
except Exception:
    pass

try:
    with engine.connect() as _conn5:
        _conn5.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR;"))
        _conn5.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP;"))
        _conn5.commit()
except Exception:
    pass

try:
    with engine.connect() as _conn6:
        _conn6.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_free_used INTEGER DEFAULT 0;"))
        _conn6.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_free_reset DATE;"))
        _conn6.commit()
except Exception:
    pass

limiter = Limiter(key_func=get_remote_address)

IS_PROD = bool(os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("DATABASE_URL", "").startswith("postgresql"))

app = FastAPI(
    title="Automation Builder API",
    description="No-code workflow automation engine",
    version="0.1.0",
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if IS_PROD:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.include_router(auth_router)
app.include_router(workflows_router)
app.include_router(executions_router)
app.include_router(stripe_router)
app.include_router(admin_router)
app.include_router(chat_router)

FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"
STATIC_DIR = Path(__file__).parent / "static"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    landing_file = STATIC_DIR / "landing.html"
    if landing_file.exists():
        return FileResponse(str(landing_file))
    if FRONTEND_DIST.exists():
        return FileResponse(str(FRONTEND_DIST / "index.html"))
    return {"name": "Weavo", "status": "running"}


@app.get("/app")
def serve_app():
    if FRONTEND_DIST.exists():
        return FileResponse(str(FRONTEND_DIST / "index.html"))
    return {"error": "App not found"}


@app.get("/landing")
def landing():
    landing_file = STATIC_DIR / "landing.html"
    if landing_file.exists():
        return FileResponse(str(landing_file))
    return {"error": "Landing page not found"}


class NewsletterRequest(BaseModel):
    email: str
    source: str = "landing"


@app.post("/newsletter")
def subscribe_newsletter(data: NewsletterRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email")
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    if existing:
        return {"status": "already_subscribed"}
    subscriber = NewsletterSubscriber(email=email, source=data.source)
    db.add(subscriber)
    db.commit()
    return {"status": "subscribed"}


@app.get("/node-types")
def list_node_types():
    types = []
    for type_key in NODE_REGISTRY:
        category, name = type_key.split(".", 1)
        types.append({"type": type_key, "category": category, "name": name})
    return types


@app.post("/webhook/{token}")
@limiter.limit("30/minute")
async def webhook_trigger(token: str, request: Request, db: Session = Depends(get_db)):
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    workflows = db.query(Workflow).filter_by(is_active=True).all()
    triggered = []

    for workflow in workflows:
        nodes = workflow.definition.get("nodes", [])
        for node in nodes:
            if node["type"] == "trigger.webhook" and node.get("config", {}).get("token") == token:
                execution = WorkflowExecution(
                    workflow_id=workflow.id,
                    trigger_data={**body, "_webhook_token": token},
                )
                db.add(execution)
                db.commit()
                db.refresh(execution)

                if os.getenv("REDIS_URL"):
                    from worker import execute_workflow_task
                    execute_workflow_task.delay(execution.id, workflow.definition, execution.trigger_data)
                else:
                    from core.engine import WorkflowEngine as _Engine
                    _engine = _Engine(db=db)
                    await _engine.run(execution.id, workflow.definition, execution.trigger_data)

                triggered.append({"workflow_id": workflow.id, "execution_id": execution.id})

    if not triggered:
        raise HTTPException(status_code=404, detail="No active workflow found for this webhook token")

    return {"triggered": triggered}


# Serve built frontend (production)
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file = FRONTEND_DIST / full_path
        if file.exists() and file.is_file():
            return FileResponse(str(file))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
