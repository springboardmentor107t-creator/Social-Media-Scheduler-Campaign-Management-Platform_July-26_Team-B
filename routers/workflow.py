from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.workflow_service import AutomatedWorkflowService

router = APIRouter(prefix="/workflow", tags=["Automated Workflow"])

async def execute_workflow_task(db_session: Session):
    service = AutomatedWorkflowService(db_session)
    await service.run_publishing_cycle()

@router.post("/trigger")
async def trigger_publishing_workflow(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Triggers the automated publishing engine workflow in the background.
    """
    service = AutomatedWorkflowService(db)
    result = await service.run_publishing_cycle()
    return {
        "message": "Publishing workflow cycle triggered successfully",
        "result": result
    }

@router.post("/trigger-bg")
def trigger_workflow_bg(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    background_tasks.add_task(execute_workflow_task, db)
    return {"message": "Publishing workflow scheduled as background task"}
