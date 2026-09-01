"""Analytics API routes for compliance metrics and reporting."""

from fastapi import APIRouter, Depends

from app.schemas.analytics import AnalyticsDashboard, AnalyticsReportRequest, AnalyticsReportResponse
from app.services.analytics_service import AnalyticsService, get_analytics_service

router = APIRouter()


@router.get("/dashboard", response_model=AnalyticsDashboard)
def get_analytics_dashboard(
    service: AnalyticsService = Depends(get_analytics_service),
) -> AnalyticsDashboard:
    """Get complete compliance analytics dashboard."""
    return service.get_dashboard()


@router.post("/report", response_model=AnalyticsReportResponse)
def generate_analytics_report(
    request: AnalyticsReportRequest,
    service: AnalyticsService = Depends(get_analytics_service),
) -> AnalyticsReportResponse:
    """Generate compliance analytics report."""
    return service.generate_report(
        report_type=request.report_type,
        include_trends=request.include_trends,
        include_recommendations=request.include_recommendations,
    )
