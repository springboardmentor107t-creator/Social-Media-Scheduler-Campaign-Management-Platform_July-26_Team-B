from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.campaign_repository import CampaignRepository
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.audience_repository import AudienceRepository
from app.repositories.post_repository import PostRepository

class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.campaign_repo = CampaignRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
        self.audience_repo = AudienceRepository(db)
        self.post_repo = PostRepository(db)

    def get_campaign_report(self, user_id: int, campaign_id: int) -> Dict[str, Any]:
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign or campaign.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )

        contents = self.campaign_repo.get_campaign_contents(campaign_id)
        analytics_records = self.analytics_repo.get_campaign_analytics(user_id, campaign_id)

        total_impressions = sum(r.impressions for r in analytics_records)
        total_reach = sum(r.reach for r in analytics_records)
        total_likes = sum(r.likes for r in analytics_records)
        total_comments = sum(r.comments for r in analytics_records)
        total_shares = sum(r.shares for r in analytics_records)
        total_clicks = sum(r.clicks for r in analytics_records)

        return {
            "campaign_id": campaign.id,
            "campaign_name": campaign.name,
            "status": campaign.status.value if hasattr(campaign.status, "value") else str(campaign.status),
            "budget": campaign.budget,
            "target_audience": campaign.target_audience,
            "total_content_items": len(contents),
            "total_impressions": total_impressions,
            "total_reach": total_reach,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "total_clicks": total_clicks,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def get_overall_performance_report(self, user_id: int) -> Dict[str, Any]:
        posts = self.post_repo.get_user_posts(user_id)
        campaigns = self.campaign_repo.get_user_campaigns(user_id)
        segments = self.audience_repo.get_user_segments(user_id)
        analytics_records = self.analytics_repo.get_user_analytics_records(user_id)

        total_impressions = sum(r.impressions for r in analytics_records)
        total_reach = sum(r.reach for r in analytics_records)
        total_likes = sum(r.likes for r in analytics_records)
        total_comments = sum(r.comments for r in analytics_records)

        return {
            "user_id": user_id,
            "total_posts": len(posts),
            "total_campaigns": len(campaigns),
            "total_audience_segments": len(segments),
            "total_impressions": total_impressions,
            "total_reach": total_reach,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def get_campaign_comparisons(self, user_id: int) -> List[Dict[str, Any]]:
        campaigns = self.campaign_repo.get_user_campaigns(user_id)
        comparisons = []

        for campaign in campaigns:
            contents = self.campaign_repo.get_campaign_contents(campaign.id)
            analytics_records = self.analytics_repo.get_campaign_analytics(user_id, campaign.id)

            total_impressions = sum(r.impressions for r in analytics_records)
            total_reach = sum(r.reach for r in analytics_records)
            total_likes = sum(r.likes for r in analytics_records)
            total_comments = sum(r.comments for r in analytics_records)
            total_shares = sum(r.shares for r in analytics_records)
            total_clicks = sum(r.clicks for r in analytics_records)
            total_engagements = total_likes + total_comments + total_shares + total_clicks

            budget = float(campaign.budget or 0.0)
            
            # ROI Calculations
            cpm = round((budget / total_impressions * 1000), 2) if total_impressions > 0 else 0.0
            cpc = round((budget / total_clicks), 2) if total_clicks > 0 else 0.0
            cpe = round((budget / total_engagements), 2) if total_engagements > 0 else 0.0
            avg_engagement_rate = round((total_engagements / max(total_reach, 1)) * 100, 2)

            # ROI efficiency index (0-100 score based on engagement per budget dollar)
            if budget > 0:
                raw_score = ((total_reach * 0.4 + total_engagements * 0.6) / budget) * 10
                roi_score = min(max(round(raw_score, 1), 0.0), 100.0)
            else:
                roi_score = 100.0 if total_engagements > 0 else 0.0

            # Performance tier
            if roi_score >= 70.0:
                performance_rating = "High Performer"
            elif roi_score >= 40.0:
                performance_rating = "Moderate"
            elif roi_score > 0.0:
                performance_rating = "Needs Optimization"
            else:
                performance_rating = "No Data"

            comparisons.append({
                "campaign_id": campaign.id,
                "campaign_name": campaign.name,
                "status": campaign.status.value if hasattr(campaign.status, "value") else str(campaign.status),
                "budget": budget,
                "target_audience": campaign.target_audience,
                "total_content_items": len(contents),
                "total_impressions": total_impressions,
                "total_reach": total_reach,
                "total_likes": total_likes,
                "total_comments": total_comments,
                "total_shares": total_shares,
                "total_clicks": total_clicks,
                "total_engagements": total_engagements,
                "avg_engagement_rate": avg_engagement_rate,
                "cpm": cpm,
                "cpc": cpc,
                "cpe": cpe,
                "roi_score": roi_score,
                "performance_rating": performance_rating,
                "start_date": campaign.start_date.isoformat() if campaign.start_date else None,
                "end_date": campaign.end_date.isoformat() if campaign.end_date else None,
            })

        # Sort comparisons by ROI score descending
        comparisons.sort(key=lambda x: x["roi_score"], reverse=True)
        return comparisons

    def export_report_data(self, user_id: int, report_type: str = "summary") -> Dict[str, Any]:
        overall = self.get_overall_performance_report(user_id)
        comparisons = self.get_campaign_comparisons(user_id)
        return {
            "report_type": report_type,
            "overall_summary": overall,
            "campaign_comparisons": comparisons,
            "export_timestamp": datetime.now(timezone.utc).isoformat()
        }

    def generate_csv_report(self, user_id: int, report_type: str = "campaigns") -> str:
        import io
        import csv

        output = io.StringIO()
        writer = csv.writer(output)

        if report_type == "campaigns":
            writer.writerow([
                "Campaign ID", "Campaign Name", "Status", "Budget ($)", 
                "Content Items", "Impressions", "Reach", "Total Engagements",
                "Likes", "Comments", "Shares", "Clicks", "Engagement Rate (%)",
                "CPM ($)", "CPC ($)", "CPE ($)", "ROI Score (0-100)", "Performance Rating"
            ])
            comparisons = self.get_campaign_comparisons(user_id)
            for c in comparisons:
                writer.writerow([
                    c["campaign_id"], c["campaign_name"], c["status"], c["budget"],
                    c["total_content_items"], c["total_impressions"], c["total_reach"],
                    c["total_engagements"], c["total_likes"], c["total_comments"],
                    c["total_shares"], c["total_clicks"], c["avg_engagement_rate"],
                    c["cpm"], c["cpc"], c["cpe"], c["roi_score"], c["performance_rating"]
                ])
        else:
            overall = self.get_overall_performance_report(user_id)
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Total Posts", overall["total_posts"]])
            writer.writerow(["Total Campaigns", overall["total_campaigns"]])
            writer.writerow(["Total Audience Segments", overall["total_audience_segments"]])
            writer.writerow(["Total Impressions", overall["total_impressions"]])
            writer.writerow(["Total Reach", overall["total_reach"]])
            writer.writerow(["Total Likes", overall["total_likes"]])
            writer.writerow(["Total Comments", overall["total_comments"]])
            writer.writerow(["Generated At", overall["generated_at"]])

        return output.getvalue()
