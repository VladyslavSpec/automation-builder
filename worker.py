import asyncio
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("automation", broker=REDIS_URL, backend=REDIS_URL)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]


@celery_app.task(name="execute_workflow")
def execute_workflow_task(execution_id: str, workflow_definition: dict, trigger_data: dict):
    from database import SessionLocal
    from core.engine import WorkflowEngine

    db = SessionLocal()
    try:
        engine = WorkflowEngine(db=db)
        asyncio.run(engine.run(execution_id, workflow_definition, trigger_data))
    finally:
        db.close()
