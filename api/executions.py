from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import WorkflowExecution, NodeExecution, Workflow, User
from api.auth import get_current_user

router = APIRouter(prefix="/executions", tags=["executions"])


@router.get("/{execution_id}")
def get_execution(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    execution = db.query(WorkflowExecution).filter_by(id=execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    workflow = db.query(Workflow).filter_by(id=execution.workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=403, detail="Access denied")
    return {
        "id": execution.id,
        "workflow_id": execution.workflow_id,
        "status": execution.status,
        "trigger_data": execution.trigger_data,
        "started_at": execution.started_at,
        "finished_at": execution.finished_at,
        "error": execution.error,
    }


@router.get("/{execution_id}/nodes")
def get_node_executions(
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    execution = db.query(WorkflowExecution).filter_by(id=execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    workflow = db.query(Workflow).filter_by(id=execution.workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=403, detail="Access denied")

    nodes = (
        db.query(NodeExecution)
        .filter_by(execution_id=execution_id)
        .order_by(NodeExecution.started_at)
        .all()
    )
    return [
        {
            "id": n.id,
            "node_id": n.node_id,
            "node_type": n.node_type,
            "status": n.status,
            "input_data": n.input_data,
            "output_data": n.output_data,
            "started_at": n.started_at,
            "finished_at": n.finished_at,
            "error": n.error,
        }
        for n in nodes
    ]
