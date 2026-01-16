# Mejoras Aplicadas al MVP

## Cambios Críticos Implementados

### 1. ✅ Invalidación de WeeklyFeedback
- **Agregado**: Campo `data_hash` en `WeeklyFeedback` para rastrear qué datos se usaron
- **Propósito**: Permitir detectar cuando los datos subyacentes cambian y marcar feedback como `outdated`
- **Implementación futura**: En domain logic, calcular hash de IDs de logs/fotos/cheat_meals usados y comparar

### 2. ✅ Constraints de Unicidad
- **DailyLog**: `UniqueConstraint('user_id', 'date')` - Un log por usuario por día
- **WeeklyFeedback**: `UniqueConstraint('user_id', 'week_start')` - Un feedback por semana
- **Beneficio**: Previene duplicados y errores de datos

### 3. ✅ Tipos de Datos Corregidos
- **DailyLog.date**: Cambiado de `DateTime` a `Date` (solo fecha)
- **Photo.date**: Cambiado de `DateTime` a `Date`
- **CheatMeal.date**: Cambiado de `DateTime` a `Date`
- **WeeklyFeedback.week_start/end**: Cambiado a `Date`
- **Razón**: Las fechas no necesitan hora, simplifica consultas y lógica

### 4. ✅ Campos Nullable Mejorados
- **Photo.body_fat_***: Todos nullable (se generan después del análisis)
- **CheatMeal.estimated_impact**: Nullable (se genera después)
- **WeeklyFeedback campos AI**: Todos nullable (se generan después)
- **Job campos**: `started_at`, `completed_at`, `input_data`, `result_data`, `error_message` nullable

### 5. ✅ Enum para JobType
- **Agregado**: `JobType` enum con valores: `photo_analysis`, `cheat_meal_analysis`, `weekly_feedback`
- **Beneficio**: Consistencia y validación a nivel de base de datos

### 6. ✅ Índices para Performance
- **DailyLog**: `(user_id, date)` - Consultas por rango de fechas
- **Photo**: `(user_id, date)` - Consultas temporales
- **CheatMeal**: `(user_id, date)` - Consultas temporales
- **WeeklyFeedback**: `(user_id, week_start)` - Búsqueda por semana
- **ProfileHistory**: `(user_id, created_at)` - Obtener perfil más reciente
- **Job**: `(user_id, status)` y `(job_type, status)` - Consultas de estado

### 7. ✅ Campo calories_source
- **Agregado**: `DailyLog.calories_source` para distinguir "manual" vs "estimated"
- **Uso**: Tracking de origen de datos para mejor análisis

### 8. ✅ Inicialización de Storage
- **Agregado**: Creación automática de directorio `photos_storage_path` en startup
- **Ubicación**: `main.py` startup event

## Recomendaciones Adicionales (No Implementadas Aún)

### A. Validación de Rangos en Domain Logic
- Validar que `body_fat_min < body_fat_max` en schemas o domain logic
- Validar que `week_start < week_end` en WeeklyFeedback

### B. Función Helper para Profile Activo
- Crear función en domain: `get_active_profile(user_id)` que retorne el más reciente
- O agregar campo `is_active` con lógica de "solo uno activo"

### C. Invalidación Automática de Feedback
- En domain logic, cuando se edita/crea DailyLog/Photo/CheatMeal:
  - Buscar WeeklyFeedbacks afectados (por rango de fechas)
  - Recalcular `data_hash` y comparar
  - Si cambió, marcar job relacionado como `outdated`

### D. Migraciones de Base de Datos
- Considerar usar Alembic para migraciones en lugar de `create_all()`
- Útil cuando se migre a PostgreSQL

### E. Soft Deletes (Opcional)
- Si se necesita historial completo, considerar `deleted_at` en lugar de borrado físico
- Por ahora, MVP puede usar borrado físico

### F. Versionado de Prompts AI
- Cuando se implemente AI, agregar tabla `prompt_versions` para rastrear qué prompt se usó
- Cumple con principio de "explainability"

## Decisiones de Diseño

### ✅ Permite Edición Retroactiva
- DailyLog puede editarse (por `updated_at`)
- Esto puede invalidar feedbacks (manejado con `data_hash`)

### ✅ Un Log por Día
- Unique constraint previene duplicados
- Si se necesita editar, se actualiza el existente

### ✅ Profile Versionado
- Cada cambio crea nuevo registro
- Perfil activo = más reciente por `created_at`

### ✅ Jobs como Entidad Central
- Todos los procesos pesados crean un Job
- Permite tracking y retry de fallos

## Próximos Pasos Sugeridos

1. **Schemas**: Validar rangos y tipos en Pydantic
2. **Domain Logic**: Implementar cálculo de `data_hash` y invalidación
3. **Domain Logic**: Helper para obtener perfil activo
4. **API Routes**: Validar que fechas sean consistentes
5. **Workers**: Implementar invalidación automática al procesar

## Notas para MVP

- **Mono-user**: Aunque el modelo soporta multi-user, MVP puede simplificar queries asumiendo un solo usuario
- **SQLite**: Funciona para MVP, migración a PostgreSQL será transparente (mismo SQLAlchemy)
- **Storage Local**: Fotos en filesystem local, fácil migrar a S3 después
