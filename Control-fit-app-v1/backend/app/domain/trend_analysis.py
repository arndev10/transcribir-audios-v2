from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Dict, Optional
from app.db.models import DailyLog


def calculate_weekly_metrics(
    db: Session,
    user_id: int,
    week_start: date,
    week_end: date
) -> Dict:
    """
    Calculates deterministic metrics for a week.
    Returns a dictionary with:
    - avg_weight: Average weight for the week
    - weight_change: Change from first to last day
    - training_days: Number of days with training
    - avg_sleep: Average sleep hours
    - total_calories: Sum of calories
    """
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == user_id,
        DailyLog.date >= week_start,
        DailyLog.date <= week_end
    ).order_by(DailyLog.date).all()
    
    if not logs:
        return {
            "avg_weight": None,
            "weight_change": None,
            "training_days": 0,
            "avg_sleep": None,
            "total_calories": None
        }
    
    # Calculate average weight (only from logs with weight)
    weights = [log.weight for log in logs if log.weight is not None]
    avg_weight = sum(weights) / len(weights) if weights else None
    
    # Calculate weight change (first to last)
    first_weight = logs[0].weight if logs[0].weight else None
    last_weight = logs[-1].weight if logs[-1].weight else None
    weight_change = (last_weight - first_weight) if (first_weight and last_weight) else None
    
    # Count training days
    training_days = sum(1 for log in logs if log.training_done)
    
    # Calculate average sleep
    sleep_hours = [log.sleep_hours for log in logs if log.sleep_hours is not None]
    avg_sleep = sum(sleep_hours) / len(sleep_hours) if sleep_hours else None
    
    # Sum calories
    calories = [log.calories for log in logs if log.calories is not None]
    total_calories = sum(calories) if calories else None
    
    return {
        "avg_weight": round(avg_weight, 2) if avg_weight else None,
        "weight_change": round(weight_change, 2) if weight_change else None,
        "training_days": training_days,
        "avg_sleep": round(avg_sleep, 2) if avg_sleep else None,
        "total_calories": total_calories
    }


def calculate_weight_trend(
    db: Session,
    user_id: int,
    start_date: date,
    end_date: date
) -> Dict:
    """
    Calculates weight trend over a date range.
    Returns trend direction and rate of change.
    """
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == user_id,
        DailyLog.date >= start_date,
        DailyLog.date <= end_date,
        DailyLog.weight.isnot(None)
    ).order_by(DailyLog.date).all()
    
    if len(logs) < 2:
        return {
            "trend": "insufficient_data",
            "rate_per_week": None,
            "first_weight": logs[0].weight if logs else None,
            "last_weight": logs[-1].weight if logs else None
        }
    
    first_weight = logs[0].weight
    last_weight = logs[-1].weight
    total_change = last_weight - first_weight
    
    # Calculate days difference
    days_diff = (logs[-1].date - logs[0].date).days
    weeks = days_diff / 7.0 if days_diff > 0 else 1
    
    rate_per_week = total_change / weeks if weeks > 0 else 0
    
    # Determine trend
    if abs(rate_per_week) < 0.1:
        trend = "stable"
    elif rate_per_week > 0:
        trend = "increasing"
    else:
        trend = "decreasing"
    
    return {
        "trend": trend,
        "rate_per_week": round(rate_per_week, 2),
        "total_change": round(total_change, 2),
        "first_weight": first_weight,
        "last_weight": last_weight,
        "days": days_diff
    }
