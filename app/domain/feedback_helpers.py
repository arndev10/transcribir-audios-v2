import hashlib
import json
from typing import List, Tuple
from sqlalchemy.orm import Session
from datetime import date
from app.db.models import WeeklyFeedback, DailyLog, Photo, CheatMeal, Job, JobStatus


def calculate_data_hash(
    log_ids: List[int],
    photo_ids: List[int],
    cheat_meal_ids: List[int]
) -> str:
    """
    Calculates a hash of the data IDs used to generate a feedback.
    This allows detecting when underlying data changes.
    """
    data_dict = {
        "logs": sorted(log_ids),
        "photos": sorted(photo_ids),
        "cheat_meals": sorted(cheat_meal_ids)
    }
    data_json = json.dumps(data_dict, sort_keys=True)
    return hashlib.sha256(data_json.encode()).hexdigest()


def get_data_ids_for_week(
    db: Session,
    user_id: int,
    week_start: date,
    week_end: date
) -> Tuple[List[int], List[int], List[int]]:
    """
    Gets all relevant data IDs for a week range.
    Returns: (log_ids, photo_ids, cheat_meal_ids)
    """
    logs = db.query(DailyLog.id).filter(
        DailyLog.user_id == user_id,
        DailyLog.date >= week_start,
        DailyLog.date <= week_end
    ).all()
    log_ids = [log.id for log in logs]
    
    photos = db.query(Photo.id).filter(
        Photo.user_id == user_id,
        Photo.date >= week_start,
        Photo.date <= week_end
    ).all()
    photo_ids = [photo.id for photo in photos]
    
    cheat_meals = db.query(CheatMeal.id).filter(
        CheatMeal.user_id == user_id,
        CheatMeal.date >= week_start,
        CheatMeal.date <= week_end
    ).all()
    cheat_meal_ids = [meal.id for meal in cheat_meals]
    
    return (log_ids, photo_ids, cheat_meal_ids)


def invalidate_feedbacks_for_date_range(
    db: Session,
    user_id: int,
    affected_date: date
) -> int:
    """
    Invalidates all weekly feedbacks that include the affected_date.
    Returns the number of feedbacks invalidated.
    """
    affected_feedbacks = db.query(WeeklyFeedback).filter(
        WeeklyFeedback.user_id == user_id,
        WeeklyFeedback.week_start <= affected_date,
        WeeklyFeedback.week_end >= affected_date,
        WeeklyFeedback.generation_job_id.isnot(None)
    ).all()
    
    invalidated_count = 0
    for feedback in affected_feedbacks:
        if feedback.generation_job_id:
            job = db.query(Job).filter(Job.id == feedback.generation_job_id).first()
            if job and job.status != JobStatus.outdated:
                job.status = JobStatus.outdated
                invalidated_count += 1
    
    db.commit()
    return invalidated_count


def check_and_invalidate_feedback(
    db: Session,
    feedback_id: int
) -> bool:
    """
    Checks if a feedback's underlying data has changed by comparing data_hash.
    If changed, marks the feedback as outdated.
    Returns True if invalidated, False otherwise.
    """
    feedback = db.query(WeeklyFeedback).filter(WeeklyFeedback.id == feedback_id).first()
    if not feedback or not feedback.data_hash:
        return False
    
    log_ids, photo_ids, cheat_meal_ids = get_data_ids_for_week(
        db, feedback.user_id, feedback.week_start, feedback.week_end
    )
    
    current_hash = calculate_data_hash(log_ids, photo_ids, cheat_meal_ids)
    
    if current_hash != feedback.data_hash:
        if feedback.generation_job_id:
            job = db.query(Job).filter(Job.id == feedback.generation_job_id).first()
            if job:
                job.status = JobStatus.outdated
        db.commit()
        return True
    
    return False
