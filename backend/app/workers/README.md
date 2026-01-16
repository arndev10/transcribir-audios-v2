# Workers - Procesamiento Asíncrono

Los workers procesan jobs asíncronos para operaciones que requieren tiempo o recursos pesados.

## Estructura

### `tasks.py`

Contiene las funciones para procesar diferentes tipos de jobs:

- `process_job(job_id)` - Función principal que procesa cualquier job
- `process_photo_analysis(job, db)` - Análisis de fotos para estimar grasa corporal
- `process_cheat_meal_analysis(job, db)` - Interpretación de comidas trampa
- `process_weekly_feedback(job, db)` - Generación de feedback semanal

## Flujo de Procesamiento

1. **Job creado**: La API crea un job con status `pending`
2. **Worker procesa**: `process_job()` actualiza status a `processing`
3. **Procesamiento**: Se ejecuta la lógica específica del tipo de job
4. **Resultado**: Status se actualiza a `done` o `failed`

## Tipos de Jobs

### Photo Analysis (`photo_analysis`)

**Input:**
```json
{
  "photo_id": 123
}
```

**Proceso:**
- Obtiene la foto
- Analiza con AI (pendiente de implementar)
- Almacena estimación de grasa corporal (rango min-max)

**Output:**
```json
{
  "photo_id": 123,
  "body_fat_min": 15.0,
  "body_fat_max": 18.0,
  "confidence": "medium"
}
```

### Cheat Meal Analysis (`cheat_meal_analysis`)

**Input:**
```json
{
  "cheat_meal_id": 456
}
```

**Proceso:**
- Obtiene la descripción del cheat meal
- Interpreta impacto cualitativo con AI (pendiente)
- Almacena interpretación

**Output:**
```json
{
  "cheat_meal_id": 456,
  "estimated_impact": "High impact - likely to affect weight for 2-3 days"
}
```

### Weekly Feedback (`weekly_feedback`)

**Input:**
```json
{
  "week_start": "2024-01-01",
  "week_end": "2024-01-07",
  "log_ids": [1, 2, 3],
  "photo_ids": [10, 11],
  "cheat_meal_ids": [5]
}
```

**Proceso:**
1. Calcula métricas determinísticas (peso promedio, cambios, etc.)
2. Analiza tendencias de grasa corporal
3. Prepara contexto para AI
4. Genera feedback interpretativo (pendiente de AI)

**Output:**
```json
{
  "feedback_id": 789,
  "analysis": {
    "metrics": {...},
    "weight_trend": {...},
    "body_fat_analysis": {...}
  },
  "ai_context": {...}
}
```

## Integración con Sistema de Colas

Para producción, estos workers deberían integrarse con un sistema de colas como:

- **Celery** con Redis/RabbitMQ
- **RQ** (Redis Queue)
- **Background Tasks** de FastAPI

Por ahora, los workers están listos para ser llamados manualmente o desde un scheduler.

## Uso Manual

```python
from app.workers.tasks import process_job

# Procesar un job
process_job(job_id=1)
```

## Próximos Pasos

1. Integrar sistema de colas (Celery recomendado)
2. Implementar servicios de AI:
   - `services/image_analysis.py` - Análisis de imágenes
   - `services/llm_service.py` - Generación de feedback
3. Agregar retry logic para jobs fallidos
4. Implementar notificaciones cuando jobs completan
