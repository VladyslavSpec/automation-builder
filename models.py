from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from database import Base


def new_id():
    return str(uuid.uuid4())


class ExecutionStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_id)
    email = Column(String, unique=True, nullable=False)
    plan = Column(String, default="free")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workflows = relationship("Workflow", back_populates="user")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    definition = Column(JSON, nullable=False)  # {nodes: [...], connections: [...]}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="workflows")
    executions = relationship("WorkflowExecution", back_populates="workflow")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(String, primary_key=True, default=new_id)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    status = Column(String, default=ExecutionStatus.pending)
    trigger_data = Column(JSON, default=dict)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)

    workflow = relationship("Workflow", back_populates="executions")
    node_executions = relationship("NodeExecution", back_populates="execution")


class NodeExecution(Base):
    __tablename__ = "node_executions"

    id = Column(String, primary_key=True, default=new_id)
    execution_id = Column(String, ForeignKey("workflow_executions.id"), nullable=False)
    node_id = Column(String, nullable=False)
    node_type = Column(String, nullable=False)
    status = Column(String, default=ExecutionStatus.pending)
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)

    execution = relationship("WorkflowExecution", back_populates="node_executions")
