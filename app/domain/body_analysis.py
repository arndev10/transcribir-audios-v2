from sqlalchemy.orm import Session
from datetime import date
from typing import Dict, List, Optional
from app.db.models import Photo


def analyze_body_fat_trends(
    db: Session,
    user_id: int,
    week_start: date,
    week_end: date
) -> Dict:
    """
    Analyzes body fat trends from photos in the week range.
    Returns analysis of body fat changes and confidence.
    """
    photos = db.query(Photo).filter(
        Photo.user_id == user_id,
        Photo.date >= week_start,
        Photo.date <= week_end,
        Photo.body_fat_min.isnot(None),
        Photo.body_fat_max.isnot(None)
    ).order_by(Photo.date).all()
    
    if not photos:
        return {
            "trend_summary": "No body fat data available for this week",
            "photos_count": 0,
            "avg_body_fat_min": None,
            "avg_body_fat_max": None,
            "trend_direction": None
        }
    
    # Calculate average body fat range
    avg_min = sum(p.body_fat_min for p in photos) / len(photos)
    avg_max = sum(p.body_fat_max for p in photos) / len(photos)
    
    # Determine trend if multiple photos
    trend_direction = None
    if len(photos) >= 2:
        first_avg = (photos[0].body_fat_min + photos[0].body_fat_max) / 2
        last_avg = (photos[-1].body_fat_min + photos[-1].body_fat_max) / 2
        change = last_avg - first_avg
        
        if abs(change) < 0.5:
            trend_direction = "stable"
        elif change < 0:
            trend_direction = "decreasing"
        else:
            trend_direction = "increasing"
    
    trend_summary = f"Body fat range: {avg_min:.1f}% - {avg_max:.1f}% (avg from {len(photos)} photo(s))"
    if trend_direction:
        trend_summary += f". Trend: {trend_direction}"
    
    return {
        "trend_summary": trend_summary,
        "photos_count": len(photos),
        "avg_body_fat_min": round(avg_min, 1),
        "avg_body_fat_max": round(avg_max, 1),
        "trend_direction": trend_direction
    }


def get_body_fat_history(
    db: Session,
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Dict]:
    """
    Gets historical body fat data from photos.
    """
    query = db.query(Photo).filter(
        Photo.user_id == user_id,
        Photo.body_fat_min.isnot(None),
        Photo.body_fat_max.isnot(None)
    )
    
    if start_date:
        query = query.filter(Photo.date >= start_date)
    if end_date:
        query = query.filter(Photo.date <= end_date)
    
    photos = query.order_by(Photo.date).all()
    
    return [
        {
            "date": photo.date.isoformat(),
            "body_fat_min": photo.body_fat_min,
            "body_fat_max": photo.body_fat_max,
            "body_fat_avg": (photo.body_fat_min + photo.body_fat_max) / 2,
            "confidence": photo.body_fat_confidence
        }
        for photo in photos
    ]
