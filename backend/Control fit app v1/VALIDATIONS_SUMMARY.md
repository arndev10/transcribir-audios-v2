# Resumen de Validaciones Implementadas

## ✅ Validaciones en Schemas (Pydantic)

### 1. **Photos** (`schemas/photos.py`)
- ✅ `body_fat_min` y `body_fat_max`: Rango 0-100 (porcentaje)
- ✅ Validación: `body_fat_min < body_fat_max` (en `PhotoUpdate` y `BodyFatEstimation`)
- ✅ Campos nullable hasta que se complete el análisis

### 2. **WeeklyFeedback** (`schemas/feedback.py`)
- ✅ Validación: `week_start < week_end`
- ✅ Validación adicional: Rango de semana debe ser 5-9 días (flexibilidad para semanas)
- ✅ Aplicado en `WeeklyFeedbackBase`, `WeeklyFeedbackCreate` y `WeeklyFeedbackRequest`

### 3. **DailyLog** (`schemas/logs.py`)
- ✅ `weight`: Debe ser > 0 (en kg)
- ✅ `sleep_hours`: Rango 0-24 horas
- ✅ `calories`: Debe ser >= 0
- ✅ `calories_source`: Pattern validation para "manual" o "estimated"

### 4. **Auth** (`schemas/auth.py`)
- ✅ `email`: Validación de formato con `EmailStr`

## ✅ Helpers en Domain Logic

### 1. **Profile Helpers** (`domain/profile_helpers.py`)
- ✅ `get_active_profile()`: Obtiene el perfil activo (más reciente)
- ✅ `get_profile_at_date()`: Obtiene el perfil activo en una fecha específica

### 2. **Feedback Helpers** (`domain/feedback_helpers.py`)
- ✅ `calculate_data_hash()`: Calcula hash de IDs de datos usados
- ✅ `get_data_ids_for_week()`: Obtiene todos los IDs relevantes para una semana
- ✅ `invalidate_feedbacks_for_date_range()`: Invalida feedbacks que incluyen una fecha
- ✅ `check_and_invalidate_feedback()`: Verifica y marca feedback como outdated si cambió

## 🔄 Flujo de Invalidación Automática

### Cuando se crea/edita un DailyLog:
```python
# En la ruta API, después de crear/actualizar:
from app.domain.feedback_helpers import invalidate_feedbacks_for_date_range

invalidate_feedbacks_for_date_range(db, user_id, log.date)
```

### Cuando se genera un WeeklyFeedback:
```python
# Calcular hash de datos usados
log_ids, photo_ids, cheat_meal_ids = get_data_ids_for_week(...)
data_hash = calculate_data_hash(log_ids, photo_ids, cheat_meal_ids)

# Guardar en feedback
feedback.data_hash = data_hash
```

### Verificación periódica (opcional):
```python
# Verificar si un feedback sigue siendo válido
was_invalidated = check_and_invalidate_feedback(db, feedback_id)
```

## 📋 Próximos Pasos de Integración

1. **En API Routes**: Integrar `invalidate_feedbacks_for_date_range()` cuando se crean/editan:
   - DailyLogs
   - Photos
   - CheatMeals

2. **En Workers**: Al generar feedback, calcular y guardar `data_hash`

3. **Validación de Rangos**: Las validaciones de Pydantic se ejecutan automáticamente al usar los schemas en las rutas

## 🎯 Beneficios

- ✅ **Prevención de errores**: Validaciones a nivel de schema previenen datos inválidos
- ✅ **Invalidación automática**: Los feedbacks se marcan como outdated cuando cambian los datos
- ✅ **Trazabilidad**: El `data_hash` permite explicar qué datos se usaron
- ✅ **Consistencia**: Helpers centralizados para lógica común
- ✅ **Type safety**: Tipos correctos en todos los schemas
