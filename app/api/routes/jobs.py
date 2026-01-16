from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.db.models import User, Job, JobStatus
from app.schemas.jobs import JobResponse, JobStatusResponse
from app.workers.tasks import process_job

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get(
    "",
    response_model=List[JobResponse],
    summary="Listar jobs",
    description="Lista todos los jobs del usuario, opcionalmente filtrados por estado (pending, processing, done, failed, outdated)."
)
def list_jobs(
    status_filter: Optional[JobStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Job.status == status_filter)
    
    jobs = query.order_by(Job.created_at.desc()).all()
    return jobs


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Obtener job específico",
    description="Obtiene un job específico con toda su información, incluyendo input_data y result_data."
)
def get_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return job


@router.get(
    "/{job_id}/status",
    response_model=JobStatusResponse,
    summary="Obtener estado de job",
    description="Obtiene el estado simplificado de un job (útil para polling o verificación rápida)."
)
def get_job_status(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return {
        "id": job.id,
        "status": job.status.value,
        "progress": None,
        "error": job.error_message
    }


@router.post(
    "/{job_id}/process",
    response_model=JobResponse,
    summary="Procesar job manualmente",
    description="Procesa un job manualmente en background. Útil para testing, reprocesamiento o cuando el procesamiento automático falla. Solo procesa jobs en estado 'pending' o 'failed'."
)
def process_job_endpoint(
    job_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.status not in [JobStatus.pending, JobStatus.failed]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Job is not in a processable state. Current status: {job.status.value}"
        )
    
    # Add to background tasks (simple async processing)
    background_tasks.add_task(process_job, job_id)
    
    db.refresh(job)
    return job
