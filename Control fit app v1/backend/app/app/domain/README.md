# Domain Logic

Este directorio contiene la lógica de negocio de la aplicación.

## Helpers Disponibles

### Profile Helpers (`profile_helpers.py`)

#### `get_active_profile(db, user_id) -> Optional[ProfileHistory]`
Obtiene el perfil activo (más reciente) de un usuario.

```python
from app.domain.profile_helpers import get_active_profile
from app.db.session import get_db

db = next(get_db())
active_profile = get_active_profile(db, user_id=1)
```

#### `get_profile_at_date(db, user_id, target_date) -> Optional[ProfileHistory]`
Obtiene el perfil que estaba activo en una fecha específica.

```python
from datetime import date
profile = get_profile_at_date(db, user_id=1, target_date=date(2024, 1, 15))
```

### Feedback Helpers (`feedback_helpers.py`)

#### `calculate_data_hash(log_ids, photo_ids, cheat_meal_ids) -> str`
Calcula un hash de los IDs de datos usados para generar un feedback.

```python
from app.domain.feedback_helpers import calculate_data_hash

hash_value = calculate_data_hash(
    log_ids=[1, 2, 3],
    photo_ids=[10, 11],
    cheat_meal_ids=[5]
)
```

#### `get_data_ids_for_week(db, user_id, week_start, week_end) -> Tuple[List[int], List[int], List[int]]`
Obtiene todos los IDs de datos relevantes para un rango de semana.

```python
from app.domain.feedback_helpers import get_data_ids_for_week
from datetime import date

log_ids, photo_ids, cheat_meal_ids = get_data_ids_for_week(
    db, 
    user_id=1,
    week_start=date(2024, 1, 1),
    week_end=date(2024, 1, 7)
)
```

#### `invalidate_feedbacks_for_date_range(db, user_id, affected_date) -> int`
Invalida todos los feedbacks que incluyen una fecha específica.

**Uso típico**: Llamar cuando se crea/edita un DailyLog, Photo o CheatMeal.

```python
from app.domain.feedback_helpers import invalidate_feedbacks_for_date_range
from datetime import date

# Cuando se edita un log del 15 de enero
invalidated_count = invalidate_feedbacks_for_date_range(
    db,
    user_id=1,
    affected_date=date(2024, 1, 15)
)
```

#### `check_and_invalidate_feedback(db, feedback_id) -> bool`
Verifica si los datos subyacentes de un feedback han cambiado comparando el hash.

```python
from app.domain.feedback_helpers import check_and_invalidate_feedback

was_invalidated = check_and_invalidate_feedback(db, feedback_id=1)
```

## Integración de Invalidación Automática

### En API Routes (cuando se crea/edita un DailyLog)

```python
from app.domain.feedback_helpers import invalidate_feedbacks_for_date_range
from app.schemas.logs import DailyLogUpdate

@router.put("/daily-logs/{log_id}")
def update_daily_log(log_id: int, log_update: DailyLogUpdate, db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    
    # Actualizar el log
    # ... código de actualización ...
    
    # Invalidar feedbacks afectados
    invalidate_feedbacks_for_date_range(db, log.user_id, log.date)
    
    return updated_log
```

### Al generar un WeeklyFeedback

```python
from app.domain.feedback_helpers import get_data_ids_for_week, calculate_data_hash

def generate_weekly_feedback(db, user_id, week_start, week_end):
    # Obtener datos
    log_ids, photo_ids, cheat_meal_ids = get_data_ids_for_week(
        db, user_id, week_start, week_end
    )
    
    # Calcular métricas determinísticas
    # ... cálculos ...
    
    # Calcular hash de datos usados
    data_hash = calculate_data_hash(log_ids, photo_ids, cheat_meal_ids)
    
    # Crear feedback con hash
    feedback = WeeklyFeedback(
        user_id=user_id,
        week_start=week_start,
        week_end=week_end,
        data_hash=data_hash,
        # ... otros campos ...
    )
    db.add(feedback)
    db.commit()
    
    return feedback
```

## Validaciones en Schemas

Los schemas incluyen validaciones automáticas:

- **Photo**: `body_fat_min < body_fat_max` (validado en `PhotoUpdate` y `BodyFatEstimation`)
- **WeeklyFeedback**: `week_start < week_end` (validado en todos los schemas)
- **DailyLog**: Rangos válidos para peso, sueño, calorías

Estas validaciones se ejecutan automáticamente cuando se usan los schemas en las rutas API.
