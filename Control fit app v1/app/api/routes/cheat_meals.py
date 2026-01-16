from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.db.models import User, CheatMeal
from app.schemas.cheat_meals import CheatMealCreate, CheatMealUpdate, CheatMealResponse
from app.domain.feedback_helpers import invalidate_feedbacks_for_date_range

router = APIRouter(prefix="/cheat-meals", tags=["cheat-meals"])


@router.post(
    "",
    response_model=CheatMealResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar comida trampa",
    description="Registra una comida trampa con descripción cualitativa. El sistema interpreta el impacto cualitativo, no el consumo exacto. Invalida automáticamente feedbacks afectados."
)
def create_cheat_meal(
    meal_data: CheatMealCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    meal = CheatMeal(
        user_id=current_user.id,
        **meal_data.model_dump()
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    
    # Invalidate affected feedbacks
    invalidate_feedbacks_for_date_range(db, current_user.id, meal_data.date)
    
    return meal


@router.get(
    "",
    response_model=List[CheatMealResponse],
    summary="Listar comidas trampa",
    description="Lista las comidas trampa del usuario, opcionalmente filtradas por rango de fechas."
)
def list_cheat_meals(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(CheatMeal).filter(CheatMeal.user_id == current_user.id)
    
    if start_date:
        query = query.filter(CheatMeal.date >= start_date)
    if end_date:
        query = query.filter(CheatMeal.date <= end_date)
    
    meals = query.order_by(CheatMeal.date.desc()).all()
    return meals


@router.get(
    "/{meal_id}",
    response_model=CheatMealResponse,
    summary="Obtener comida trampa específica",
    description="Retorna una comida trampa específica con su descripción e interpretación del impacto (si está disponible)."
)
def get_cheat_meal(
    meal_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    meal = db.query(CheatMeal).filter(
        CheatMeal.id == meal_id,
        CheatMeal.user_id == current_user.id
    ).first()
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cheat meal not found"
        )
    return meal


@router.put(
    "/{meal_id}",
    response_model=CheatMealResponse,
    summary="Actualizar comida trampa",
    description="Actualiza una comida trampa existente. Invalida feedbacks si cambia la fecha."
)
def update_cheat_meal(
    meal_id: int,
    meal_update: CheatMealUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    meal = db.query(CheatMeal).filter(
        CheatMeal.id == meal_id,
        CheatMeal.user_id == current_user.id
    ).first()
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cheat meal not found"
        )
    
    update_data = meal_update.model_dump(exclude_unset=True)
    affected_date = update_data.get("date", meal.date)
    
    for field, value in update_data.items():
        setattr(meal, field, value)
    
    db.commit()
    db.refresh(meal)
    
    # Invalidate affected feedbacks if date changed
    if "date" in update_data:
        invalidate_feedbacks_for_date_range(db, current_user.id, affected_date)
    
    return meal


@router.delete(
    "/{meal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar comida trampa",
    description="Elimina una comida trampa. Invalida automáticamente feedbacks afectados."
)
def delete_cheat_meal(
    meal_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    meal = db.query(CheatMeal).filter(
        CheatMeal.id == meal_id,
        CheatMeal.user_id == current_user.id
    ).first()
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cheat meal not found"
        )
    
    affected_date = meal.date
    db.delete(meal)
    db.commit()
    
    # Invalidate affected feedbacks
    invalidate_feedbacks_for_date_range(db, current_user.id, affected_date)
