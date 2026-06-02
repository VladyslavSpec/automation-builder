from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import WorkflowExecution, NodeExecution

router = APIRouter(prefix="/executions", tags=["executions"])


@router.get("/{execution_id}")
def get_execution(execution_id: str, db: Session = Depends(get_db)):
    execution = db.query(WorkflowExecution).filter_by(id=execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
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
def get_node_executions(execution_id: str, db: Session = Depends(get_db)):
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
