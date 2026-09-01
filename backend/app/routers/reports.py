from typing import Dict, Any, List
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.report_service import ReportService
from app.core.security import get_current_user

router = APIRouter(prefix="/reports", tags=["Report Generation"])

@router.get("", response_model=Dict[str, Any])
def get_reports_root(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReportService(db)
    return service.get_overall_performance_report(current_user.id)

@router.get("/campaigns/{campaign_id}", response_model=Dict[str, Any])
def get_campaign_report(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReportService(db)
    return service.get_campaign_report(current_user.id, campaign_id)

@router.get("/comparison", response_model=List[Dict[str, Any]])
def get_campaign_comparisons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReportService(db)
    return service.get_campaign_comparisons(current_user.id)

@router.get("/overview", response_model=Dict[str, Any])
def get_overall_performance_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReportService(db)
    return service.get_overall_performance_report(current_user.id)

@router.get("/export", response_model=Dict[str, Any])
def export_report_data(
    report_type: str = "summary",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReportService(db)
    return service.export_report_data(current_user.id, report_type=report_type)

@router.get("/export/csv")
def export_report_csv(
    report_type: str = "campaigns",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReportService(db)
    csv_data = service.generate_csv_report(current_user.id, report_type=report_type)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=socialpilot_{report_type}_report.csv"
        }
    )
