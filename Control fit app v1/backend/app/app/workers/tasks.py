import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.models import Job, JobStatus, JobType, Photo, CheatMeal, WeeklyFeedback
from app.db.session import SessionLocal
from app.domain.feedback_helpers import (
    get_data_ids_for_week,
    calculate_data_hash
)


def get_db_session() -> Session:
    """Get a database session for workers"""
    return SessionLocal()


def process_job(job_id: int) -> None:
    """
    Process a job based on its type.
    This function is called by the worker system.
    """
    db = get_db_session()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return
        
        # Update job status to processing
        job.status = JobStatus.processing
        job.started_at = datetime.utcnow()
        db.commit()
        
        # Process based on job type
        if job.job_type == JobType.photo_analysis:
            process_photo_analysis(job, db)
        elif job.job_type == JobType.cheat_meal_analysis:
            process_cheat_meal_analysis(job, db)
        elif job.job_type == JobType.weekly_feedback:
            process_weekly_feedback(job, db)
        else:
            raise ValueError(f"Unknown job type: {job.job_type}")
        
        # Mark as done
        job.status = JobStatus.done
        job.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        # Mark as failed
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = JobStatus.failed
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            db.commit()
        raise
    finally:
        db.close()


def process_photo_analysis(job: Job, db: Session) -> None:
    """
    Process photo analysis job.
    For MVP, this is a placeholder - AI integration will be added later.
    """
    input_data = json.loads(job.input_data) if job.input_data else {}
    photo_id = input_data.get("photo_id")
    
    if not photo_id:
        raise ValueError("photo_id is required for photo analysis")
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise ValueError(f"Photo {photo_id} not found")
    
    # TODO: Integrate AI service for body fat estimation
    # For now, just mark as processed
    result_data = {
        "photo_id": photo_id,
        "status": "processed",
        "note": "AI analysis not yet implemented - placeholder"
    }
    
    job.result_data = json.dumps(result_data)
    db.commit()


def process_cheat_meal_analysis(job: Job, db: Session) -> None:
    """
    Process cheat meal analysis job.
    For MVP, this is a placeholder - AI integration will be added later.
    """
    input_data = json.loads(job.input_data) if job.input_data else {}
    cheat_meal_id = input_data.get("cheat_meal_id")
    
    if not cheat_meal_id:
        raise ValueError("cheat_meal_id is required for cheat meal analysis")
    
    cheat_meal = db.query(CheatMeal).filter(CheatMeal.id == cheat_meal_id).first()
    if not cheat_meal:
        raise ValueError(f"Cheat meal {cheat_meal_id} not found")
    
    # TODO: Integrate AI service for impact interpretation
    # For now, just mark as processed
    result_data = {
        "cheat_meal_id": cheat_meal_id,
        "status": "processed",
        "note": "AI analysis not yet implemented - placeholder"
    }
    
    job.result_data = json.dumps(result_data)
    db.commit()


def process_weekly_feedback(job: Job, db: Session) -> None:
    """
    Process weekly feedback generation job.
    This calculates deterministic metrics and prepares for AI analysis.
    """
    from app.domain.feedback_engine import generate_deterministic_analysis, prepare_ai_context
    
    input_data = json.loads(job.input_data) if job.input_data else {}
    week_start_str = input_data.get("week_start")
    week_end_str = input_data.get("week_end")
    user_id = job.user_id
    
    if not week_start_str or not week_end_str:
        raise ValueError("week_start and week_end are required")
    
    from datetime import date
    week_start = date.fromisoformat(week_start_str)
    week_end = date.fromisoformat(week_end_str)
    
    # Find feedback
    feedback = db.query(WeeklyFeedback).filter(
        WeeklyFeedback.user_id == user_id,
        WeeklyFeedback.week_start == week_start,
        WeeklyFeedback.generation_job_id == job.id
    ).first()
    
    if not feedback:
        raise ValueError(f"WeeklyFeedback not found for job {job.id}")
    
    # Generate deterministic analysis
    analysis = generate_deterministic_analysis(db, user_id, week_start, week_end)
    
    # Update feedback with metrics
    feedback.avg_weight = analysis["metrics"].get("avg_weight")
    feedback.weight_change = analysis["metrics"].get("weight_change")
    feedback.training_days = analysis["metrics"].get("training_days")
    feedback.avg_sleep = analysis["metrics"].get("avg_sleep")
    feedback.total_calories = analysis["metrics"].get("total_calories")
    
    # Store body fat trend summary
    feedback.body_fat_trend = analysis["body_fat_analysis"].get("trend_summary")
    
    # Prepare context for AI (for future use)
    ai_context = prepare_ai_context(db, user_id, week_start, week_end)
    
    # TODO: Integrate AI service for interpretive feedback
    # For now, store deterministic analysis
    result_data = {
        "feedback_id": feedback.id,
        "analysis": analysis,
        "ai_context": ai_context,
        "status": "deterministic_metrics_calculated",
        "note": "AI interpretation not yet implemented - ready for AI integration"
    }
    
    job.result_data = json.dumps(result_data, default=str)
    db.commit()
