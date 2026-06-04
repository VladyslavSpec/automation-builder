from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os

from database import get_db
from models import Workflow, WorkflowExecution, User
from api.auth import get_current_user

router = APIRouter(prefix="/workflows", tags=["workflows"])


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    definition: dict


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    definition: Optional[dict] = None


@router.get("/")
def list_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflows = db.query(Workflow).filter_by(user_id=current_user.id).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "description": w.description,
            "is_active": w.is_active,
            "created_at": w.created_at,
            "updated_at": w.updated_at,
            "definition": w.definition,
        }
        for w in workflows
    ]


@router.post("/", status_code=201)
def create_workflow(
    body: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = Workflow(
        user_id=current_user.id,
        name=body.name,
        description=body.description,
        definition=body.definition,
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return {"id": workflow.id, "name": workflow.name}


@router.get("/{workflow_id}")
def get_workflow(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.put("/{workflow_id}")
def update_workflow(
    workflow_id: str,
    body: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if body.name is not None:
        workflow.name = body.name
    if body.description is not None:
        workflow.description = body.description
    if body.is_active is not None:
        workflow.is_active = body.is_active
    if body.definition is not None:
        workflow.definition = body.definition
    workflow.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"id": workflow.id, "updated": True}


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(workflow)
    db.commit()


@router.post("/{workflow_id}/run", status_code=202)
async def run_workflow(
    workflow_id: str,
    trigger_data: dict = {},
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if not workflow.is_active:
        raise HTTPException(status_code=400, detail="Workflow is inactive")

    execution = WorkflowExecution(
        workflow_id=workflow_id,
        trigger_data=trigger_data,
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    use_celery = bool(os.getenv("REDIS_URL"))
    queued = False

    if use_celery:
        from worker import execute_workflow_task
        execute_workflow_task.delay(execution.id, workflow.definition, trigger_data)
        queued = True
    else:
        from core.engine import WorkflowEngine
        engine = WorkflowEngine(db=db)
        await engine.run(execution.id, workflow.definition, trigger_data)

    return {"execution_id": execution.id, "queued": queued}


@router.get("/{workflow_id}/executions")
def list_executions(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    executions = (
        db.query(WorkflowExecution)
        .filter_by(workflow_id=workflow_id)
        .order_by(WorkflowExecution.started_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": e.id,
            "status": e.status,
            "started_at": e.started_at,
            "finished_at": e.finished_at,
            "error": e.error,
        }
        for e in executions
    ]
