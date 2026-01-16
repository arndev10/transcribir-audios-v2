from sqlalchemy.orm import Session
from datetime import date
from typing import Dict, Optional
from app.db.models import WeeklyFeedback, DailyLog, Photo, CheatMeal
from app.domain.trend_analysis import calculate_weekly_metrics, calculate_weight_trend
from app.domain.body_analysis import analyze_body_fat_trends
from app.domain.profile_helpers import get_profile_at_date


def gather_weekly_data(
    db: Session,
    user_id: int,
    week_start: date,
    week_end: date
) -> Dict:
    """
    Gathers all relevant data for weekly feedback generation.
    Returns a dictionary with logs, photos, cheat meals, and profile.
    """
    # Get logs
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == user_id,
        DailyLog.date >= week_start,
        DailyLog.date <= week_end
    ).order_by(DailyLog.date).all()
    
    # Get photos
    photos = db.query(Photo).filter(
        Photo.user_id == user_id,
        Photo.date >= week_start,
        Photo.date <= week_end
    ).order_by(Photo.date).all()
    
    # Get cheat meals
    cheat_meals = db.query(CheatMeal).filter(
        CheatMeal.user_id == user_id,
        CheatMeal.date >= week_start,
        CheatMeal.date <= week_end
    ).order_by(CheatMeal.date).all()
    
    # Get active profile for the week
    profile = get_profile_at_date(db, user_id, week_start)
    
    return {
        "logs": logs,
        "photos": photos,
        "cheat_meals": cheat_meals,
        "profile": profile,
        "week_start": week_start,
        "week_end": week_end
    }


def generate_deterministic_analysis(
    db: Session,
    user_id: int,
    week_start: date,
    week_end: date
) -> Dict:
    """
    Generates deterministic analysis (without AI) for a week.
    This is the foundation that AI will build upon.
    """
    # Calculate metrics
    metrics = calculate_weekly_metrics(db, user_id, week_start, week_end)
    
    # Calculate weight trend
    weight_trend = calculate_weight_trend(db, user_id, week_start, week_end)
    
    # Analyze body fat
    body_fat_analysis = analyze_body_fat_trends(db, user_id, week_start, week_end)
    
    # Gather data
    data = gather_weekly_data(db, user_id, week_start, week_end)
    
    # Build analysis summary
    analysis = {
        "metrics": metrics,
        "weight_trend": weight_trend,
        "body_fat_analysis": body_fat_analysis,
        "data_summary": {
            "logs_count": len(data["logs"]),
            "photos_count": len(data["photos"]),
            "cheat_meals_count": len(data["cheat_meals"]),
            "has_profile": data["profile"] is not None
        }
    }
    
    return analysis


def prepare_ai_context(
    db: Session,
    user_id: int,
    week_start: date,
    week_end: date
) -> Dict:
    """
    Prepares context data for AI feedback generation.
    This includes deterministic metrics and qualitative data summaries.
    """
    analysis = generate_deterministic_analysis(db, user_id, week_start, week_end)
    data = gather_weekly_data(db, user_id, week_start, week_end)
    
    # Prepare cheat meals descriptions
    cheat_meal_descriptions = [
        {
            "date": meal.date.isoformat(),
            "description": meal.description,
            "estimated_impact": meal.estimated_impact
        }
        for meal in data["cheat_meals"]
    ]
    
    # Prepare context for AI
    context = {
        "week": {
            "start": week_start.isoformat(),
            "end": week_end.isoformat()
        },
        "metrics": analysis["metrics"],
        "weight_trend": analysis["weight_trend"],
        "body_fat": analysis["body_fat_analysis"],
        "training_context": {
            "days_per_week": data["profile"].training_days_per_week if data["profile"] else None,
            "training_type": data["profile"].training_type if data["profile"] else None,
            "activity_level": data["profile"].activity_level if data["profile"] else None
        },
        "cheat_meals": cheat_meal_descriptions,
        "data_quality": {
            "has_weight_data": analysis["metrics"]["avg_weight"] is not None,
            "has_sleep_data": analysis["metrics"]["avg_sleep"] is not None,
            "has_calories_data": analysis["metrics"]["total_calories"] is not None,
            "has_body_fat_data": analysis["body_fat_analysis"]["photos_count"] > 0
        }
    }
    
    return context
