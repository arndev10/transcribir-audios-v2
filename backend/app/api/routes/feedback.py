import json
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.db.models import User, WeeklyFeedback, Job, JobType, JobStatus
from app.schemas.feedback import WeeklyFeedbackRequest, WeeklyFeedbackResponse
from app.domain.feedback_helpers import (
    get_data_ids_for_week,
    calculate_data_hash,
    check_and_invalidate_feedback
)
from app.workers.tasks import process_job

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "/weekly",
    response_model=WeeklyFeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Solicitar feedback semanal",
    description="Solicita la generación de feedback semanal para un rango de fechas. Crea un job asíncrono que analiza logs, fotos y comidas trampa de la semana para generar interpretación sobre grasa corporal, inflamación, retención de líquidos y consistencia."
)
def request_weekly_feedback(
    request: WeeklyFeedbackRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if feedback already exists for this week
    existing_feedback = db.query(WeeklyFeedback).filter(
        WeeklyFeedback.user_id == current_user.id,
        WeeklyFeedback.week_start == request.week_start
    ).first()
    
    if existing_feedback:
        # Check if it's outdated
        was_invalidated = check_and_invalidate_feedback(db, existing_feedback.id)
        if not was_invalidated and existing_feedback.generation_job_id:
            job = db.query(Job).filter(Job.id == existing_feedback.generation_job_id).first()
            if job and job.status == JobStatus.done:
                return existing_feedback
            elif job and job.status in [JobStatus.pending, JobStatus.processing]:
                raise HTTPException(
                    status_code=status.HTTP_202_ACCEPTED,
                    detail="Feedback generation already in progress"
                )
    
    # Get data IDs for the week
    log_ids, photo_ids, cheat_meal_ids = get_data_ids_for_week(
        db, current_user.id, request.week_start, request.week_end
    )
    
    # Calculate data hash
    data_hash = calculate_data_hash(log_ids, photo_ids, cheat_meal_ids)
    
    # Create job for async processing
    job = Job(
        user_id=current_user.id,
        job_type=JobType.weekly_feedback,
        status=JobStatus.pending,
        input_data=json.dumps({
            "week_start": request.week_start.isoformat(),
            "week_end": request.week_end.isoformat(),
            "log_ids": log_ids,
            "photo_ids": photo_ids,
            "cheat_meal_ids": cheat_meal_ids
        })
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Create feedback record (will be populated by worker)
    feedback = WeeklyFeedback(
        user_id=current_user.id,
        week_start=request.week_start,
        week_end=request.week_end,
        data_hash=data_hash,
        generation_job_id=job.id
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    # Process job in background
    background_tasks.add_task(process_job, job.id)
    
    return feedback


@router.get(
    "/weekly",
    response_model=List[WeeklyFeedbackResponse],
    summary="Listar feedbacks semanales",
    description="Lista los feedbacks semanales generados, opcionalmente filtrados por rango de fechas."
)
def list_weekly_feedbacks(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(WeeklyFeedback).filter(WeeklyFeedback.user_id == current_user.id)
    
    if start_date:
        query = query.filter(WeeklyFeedback.week_start >= start_date)
    if end_date:
        query = query.filter(WeeklyFeedback.week_end <= end_date)
    
    feedbacks = query.order_by(WeeklyFeedback.week_start.desc()).all()
    return feedbacks


@router.get(
    "/weekly/{feedback_id}",
    response_model=WeeklyFeedbackResponse,
    summary="Obtener feedback semanal específico",
    description="Retorna un feedback semanal específico. Verifica automáticamente si el feedback sigue siendo válido (no outdated) comparando los datos subyacentes."
)
def get_weekly_feedback(
    feedback_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    feedback = db.query(WeeklyFeedback).filter(
        WeeklyFeedback.id == feedback_id,
        WeeklyFeedback.user_id == current_user.id
    ).first()
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )
    
    # Check if feedback is still valid
    check_and_invalidate_feedback(db, feedback_id)
    db.refresh(feedback)
    
    return feedback
