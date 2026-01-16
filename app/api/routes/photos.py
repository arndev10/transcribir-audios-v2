from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from datetime import date as date_type
from pathlib import Path
import shutil
import uuid
import mimetypes
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.config import settings
from app.db.models import User, Photo
from app.schemas.photos import PhotoCreate, PhotoUpdate, PhotoResponse
from app.domain.feedback_helpers import invalidate_feedbacks_for_date_range

router = APIRouter(prefix="/photos", tags=["photos"])


def save_photo_file(file: UploadFile, user_id: int) -> Tuple[str, str]:
    """Saves uploaded file and returns (file_path, file_name)"""
    file_ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    storage_path = Path(settings.photos_storage_path).resolve() / str(user_id)
    storage_path.mkdir(parents=True, exist_ok=True)
    
    file_path = storage_path / unique_filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Guardar como ruta absoluta para evitar problemas de resolución
    absolute_path = file_path.resolve()
    print(f"DEBUG: Guardando foto - ruta absoluta: {absolute_path}")
    return str(absolute_path), unique_filename


@router.post(
    "",
    response_model=PhotoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subir foto corporal",
    description="Sube una foto corporal para análisis. La foto se almacena localmente y puede ser analizada para estimar grasa corporal. Invalida automáticamente feedbacks afectados."
)
def upload_photo(
    file: UploadFile = File(...),
    date: str = Form(..., description="Date in YYYY-MM-DD format"),
    is_best_state: bool = Form(False),
    user_notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Convertir string a date
    try:
        photo_date = date_type.fromisoformat(date)
    except (ValueError, AttributeError) as e:
        print(f"ERROR: No se pudo convertir fecha: {date}, error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid date format: {date}. Expected YYYY-MM-DD. Error: {str(e)}"
        )
    
    print(f"DEBUG: Recibiendo foto - date recibido: '{date}', date convertido: {photo_date}, is_best_state: {is_best_state}, user_notes: {user_notes}")
    print(f"DEBUG: Usuario: {current_user.email}, Archivo: {file.filename}")
    file_path, file_name = save_photo_file(file, current_user.id)
    
    photo = Photo(
        user_id=current_user.id,
        date=photo_date,
        file_path=file_path,
        file_name=file_name,
        is_best_state=is_best_state,
        user_notes=user_notes
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    # Invalidate affected feedbacks
    invalidate_feedbacks_for_date_range(db, current_user.id, photo_date)
    
    return photo


@router.get(
    "",
    response_model=List[PhotoResponse],
    summary="Listar fotos",
    description="Lista las fotos corporales del usuario, opcionalmente filtradas por rango de fechas."
)
def list_photos(
    start_date: Optional[date_type] = None,
    end_date: Optional[date_type] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Photo).filter(Photo.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Photo.date >= start_date)
    if end_date:
        query = query.filter(Photo.date <= end_date)
    
    photos = query.order_by(Photo.date.desc()).all()
    return photos


@router.get(
    "/{photo_id}",
    response_model=PhotoResponse,
    summary="Obtener foto específica",
    description="Retorna una foto corporal específica con su información y estimación de grasa corporal (si está disponible)."
)
def get_photo(
    photo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.user_id == current_user.id
    ).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    return photo


@router.get(
    "/{photo_id}/file",
    summary="Obtener archivo de foto",
    description="Retorna el archivo de imagen de la foto. Requiere autenticación y verifica que la foto pertenezca al usuario."
)
def get_photo_file(
    photo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.user_id == current_user.id
    ).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Resolver la ruta - puede ser absoluta o relativa
    file_path = Path(photo.file_path)
    
    # Si es relativa, resolver desde el directorio de trabajo actual
    if not file_path.is_absolute():
        file_path = file_path.resolve()
    
    # Si aún no existe, intentar desde el directorio base de storage
    if not file_path.exists():
        storage_base = Path(settings.photos_storage_path).resolve()
        potential_path = storage_base / photo.file_path
        if potential_path.exists():
            file_path = potential_path
        else:
            # Intentar con solo el nombre del archivo
            potential_path = storage_base / str(current_user.id) / photo.file_name
            if potential_path.exists():
                file_path = potential_path
    
    print(f"DEBUG get_photo_file: photo_id={photo_id}, user_id={current_user.id}")
    print(f"DEBUG: file_path guardado en DB: {photo.file_path}")
    print(f"DEBUG: file_path resuelto: {file_path}")
    print(f"DEBUG: file_path absoluto: {file_path.absolute()}")
    print(f"DEBUG: file_path existe: {file_path.exists()}")
    
    if not file_path.exists():
        # Listar archivos en el directorio de storage para debugging
        storage_dir = Path(settings.photos_storage_path).resolve() / str(current_user.id)
        if storage_dir.exists():
            files = list(storage_dir.glob('*'))
            print(f"DEBUG: Archivos en {storage_dir}: {[str(f) for f in files]}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Photo file not found at: {file_path.absolute()}"
        )
    
    media_type, _ = mimetypes.guess_type(str(file_path))
    if not media_type or not media_type.startswith('image/'):
        media_type = 'image/jpeg'
    
    return FileResponse(
        path=str(file_path.absolute()),
        media_type=media_type,
        filename=photo.file_name
    )


@router.put(
    "/{photo_id}",
    response_model=PhotoResponse,
    summary="Actualizar foto",
    description="Actualiza una foto existente. Permite actualizar la estimación de grasa corporal (rango min-max), notas del usuario y marcar como mejor estado físico. Invalida feedbacks si cambia la fecha."
)
def update_photo(
    photo_id: int,
    photo_update: PhotoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.user_id == current_user.id
    ).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    update_data = photo_update.model_dump(exclude_unset=True)
    affected_date = update_data.get("date", photo.date)
    
    for field, value in update_data.items():
        setattr(photo, field, value)
    
    db.commit()
    db.refresh(photo)
    
    # Invalidate affected feedbacks if date changed
    if "date" in update_data:
        invalidate_feedbacks_for_date_range(db, current_user.id, affected_date)
    
    return photo


@router.delete(
    "/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar foto",
    description="Elimina una foto y su archivo del almacenamiento. Invalida automáticamente feedbacks afectados."
)
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.user_id == current_user.id
    ).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    affected_date = photo.date
    
    # Delete file from storage
    file_path = Path(photo.file_path)
    if file_path.exists():
        file_path.unlink()
    
    db.delete(photo)
    db.commit()
    
    # Invalidate affected feedbacks
    invalidate_feedbacks_for_date_range(db, current_user.id, affected_date)
