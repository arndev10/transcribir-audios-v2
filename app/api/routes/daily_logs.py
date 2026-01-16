from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.db.models import User, DailyLog
from app.schemas.logs import DailyLogCreate, DailyLogUpdate, DailyLogResponse
from app.domain.feedback_helpers import invalidate_feedbacks_for_date_range

router = APIRouter(prefix="/daily-logs", tags=["daily-logs"])


@router.post(
    "",
    response_model=DailyLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear registro diario",
    description="Crea un nuevo registro diario con peso, sueño, entrenamiento y calorías. Invalida automáticamente feedbacks afectados."
)
def create_daily_log(
    log_data: DailyLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if log already exists for this date
    existing_log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date == log_data.date
    ).first()
    
    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Log already exists for this date. Use PUT to update."
        )
    
    log = DailyLog(
        user_id=current_user.id,
        **log_data.model_dump()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    # Invalidate affected feedbacks
    invalidate_feedbacks_for_date_range(db, current_user.id, log_data.date)
    
    return log


@router.get(
    "",
    response_model=List[DailyLogResponse],
    summary="Listar registros diarios",
    description="Lista los registros diarios del usuario, opcionalmente filtrados por rango de fechas."
)
def list_daily_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(DailyLog).filter(DailyLog.user_id == current_user.id)
    
    if start_date:
        query = query.filter(DailyLog.date >= start_date)
    if end_date:
        query = query.filter(DailyLog.date <= end_date)
    
    logs = query.order_by(DailyLog.date.desc()).all()
    return logs


@router.get(
    "/{log_id}",
    response_model=DailyLogResponse,
    summary="Obtener registro diario",
    description="Retorna un registro diario específico por su ID."
)
def get_daily_log(
    log_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id,
        DailyLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found"
        )
    return log


@router.put(
    "/{log_id}",
    response_model=DailyLogResponse,
    summary="Actualizar registro diario",
    description="Actualiza un registro diario existente. Permite edición retroactiva. Invalida automáticamente feedbacks afectados."
)
def update_daily_log(
    log_id: int,
    log_update: DailyLogUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id,
        DailyLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found"
        )
    
    update_data = log_update.model_dump(exclude_unset=True)
    affected_date = update_data.get("date", log.date)
    
    for field, value in update_data.items():
        setattr(log, field, value)
    
    db.commit()
    db.refresh(log)
    
    # Invalidate affected feedbacks
    invalidate_feedbacks_for_date_range(db, current_user.id, affected_date)
    
    return log


@router.delete(
    "/{log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar registro diario",
    description="Elimina un registro diario. Invalida automáticamente feedbacks afectados."
)
def delete_daily_log(
    log_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id,
        DailyLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found"
        )
    
    affected_date = log.date
    db.delete(log)
    db.commit()
    
    # Invalidate affected feedbacks
    invalidate_feedbacks_for_date_range(db, current_user.id, affected_date)
