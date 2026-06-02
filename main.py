from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base, get_db
from models import Workflow, WorkflowExecution
from api.workflows import router as workflows_router
from api.executions import router as executions_router
from core.nodes.base import BaseNode
from core.engine import NODE_REGISTRY

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Automation Builder API",
    description="No-code workflow automation engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflows_router)
app.include_router(executions_router)

FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "name": "Automation Builder",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/node-types")
def list_node_types():
    """Returns all available node types with their categories."""
    types = []
    for type_key in NODE_REGISTRY:
        category, name = type_key.split(".", 1)
        types.append({"type": type_key, "category": category, "name": name})
    return types


@app.post("/webhook/{token}")
async def webhook_trigger(token: str, request: Request, db: Session = Depends(get_db)):
    """Receives incoming webhooks and triggers matching workflows."""
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    # Find active workflow with a webhook trigger node matching this token
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


# Serve built frontend (production only — skip if dist not built yet)
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file = FRONTEND_DIST / full_path
        if file.exists() and file.is_file():
            return FileResponse(str(file))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
