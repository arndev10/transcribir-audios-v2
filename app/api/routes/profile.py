from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.db.models import User, ProfileHistory
from app.schemas.profile import ProfileHistoryCreate, ProfileHistoryResponse
from app.domain.profile_helpers import get_active_profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post(
    "",
    response_model=ProfileHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo perfil",
    description="Crea un nuevo perfil de entrenamiento. Los perfiles son versionados, cada cambio crea un nuevo snapshot."
)
def create_profile(
    profile_data: ProfileHistoryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = ProfileHistory(
        user_id=current_user.id,
        **profile_data.model_dump()
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get(
    "/active",
    response_model=ProfileHistoryResponse,
    summary="Obtener perfil activo",
    description="Retorna el perfil de entrenamiento más reciente (activo) del usuario."
)
def get_active_profile_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = get_active_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile found"
        )
    return profile


@router.get(
    "",
    response_model=List[ProfileHistoryResponse],
    summary="Listar perfiles",
    description="Lista todos los perfiles de entrenamiento del usuario, ordenados por fecha descendente."
)
def list_profiles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profiles = db.query(ProfileHistory).filter(
        ProfileHistory.user_id == current_user.id
    ).order_by(ProfileHistory.created_at.desc()).all()
    return profiles


@router.get(
    "/{profile_id}",
    response_model=ProfileHistoryResponse,
    summary="Obtener perfil específico",
    description="Retorna un perfil de entrenamiento específico por su ID."
)
def get_profile(
    profile_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ProfileHistory).filter(
        ProfileHistory.id == profile_id,
        ProfileHistory.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile
