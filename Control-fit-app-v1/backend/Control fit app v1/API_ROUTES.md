# API Routes Documentation

## Autenticación

### `POST /api/auth/register`
Registra un nuevo usuario.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `UserResponse` (201 Created)

### `POST /api/auth/login`
Inicia sesión y obtiene token JWT.

**Request Body:** (form-data)
- `username`: email del usuario
- `password`: contraseña

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### `GET /api/auth/me`
Obtiene información del usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Response:** `UserResponse`

---

## Perfiles

### `POST /api/profile`
Crea un nuevo perfil (versionado).

**Request Body:**
```json
{
  "training_days_per_week": 4,
  "training_type": "strength",
  "activity_level": "moderate",
  "notes": "Starting new program"
}
```

**Response:** `ProfileHistoryResponse` (201 Created)

### `GET /api/profile/active`
Obtiene el perfil activo (más reciente).

**Response:** `ProfileHistoryResponse`

### `GET /api/profile`
Lista todos los perfiles del usuario (ordenados por fecha descendente).

**Response:** `List[ProfileHistoryResponse]`

### `GET /api/profile/{profile_id}`
Obtiene un perfil específico.

**Response:** `ProfileHistoryResponse`

---

## Daily Logs

### `POST /api/daily-logs`
Crea un nuevo log diario.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "weight": 75.5,
  "sleep_hours": 7.5,
  "training_done": true,
  "calories": 2200,
  "calories_source": "manual",
  "notes": "Feeling good today"
}
```

**Response:** `DailyLogResponse` (201 Created)

**Nota:** Invalida automáticamente feedbacks afectados.

### `GET /api/daily-logs`
Lista logs diarios (opcionalmente filtrados por fecha).

**Query Parameters:**
- `start_date` (opcional): Fecha de inicio
- `end_date` (opcional): Fecha de fin

**Response:** `List[DailyLogResponse]`

### `GET /api/daily-logs/{log_id}`
Obtiene un log específico.

**Response:** `DailyLogResponse`

### `PUT /api/daily-logs/{log_id}`
Actualiza un log existente.

**Request Body:** `DailyLogUpdate` (campos opcionales)

**Response:** `DailyLogResponse`

**Nota:** Invalida automáticamente feedbacks afectados.

### `DELETE /api/daily-logs/{log_id}`
Elimina un log.

**Response:** 204 No Content

**Nota:** Invalida automáticamente feedbacks afectados.

---

## Photos

### `POST /api/photos`
Sube una nueva foto.

**Request:** (multipart/form-data)
- `file`: Archivo de imagen
- `date`: Fecha de la foto (YYYY-MM-DD)
- `is_best_state`: boolean (opcional, default: false)
- `user_notes`: string (opcional)

**Response:** `PhotoResponse` (201 Created)

**Nota:** Invalida automáticamente feedbacks afectados.

### `GET /api/photos`
Lista fotos (opcionalmente filtradas por fecha).

**Query Parameters:**
- `start_date` (opcional): Fecha de inicio
- `end_date` (opcional): Fecha de fin

**Response:** `List[PhotoResponse]`

### `GET /api/photos/{photo_id}`
Obtiene una foto específica.

**Response:** `PhotoResponse`

### `PUT /api/photos/{photo_id}`
Actualiza una foto (incluye estimación de grasa corporal).

**Request Body:** `PhotoUpdate`
```json
{
  "body_fat_min": 15.0,
  "body_fat_max": 18.0,
  "body_fat_confidence": "medium",
  "is_best_state": true
}
```

**Response:** `PhotoResponse`

**Nota:** Invalida feedbacks si cambia la fecha.

### `DELETE /api/photos/{photo_id}`
Elimina una foto (y su archivo).

**Response:** 204 No Content

**Nota:** Invalida automáticamente feedbacks afectados.

---

## Cheat Meals

### `POST /api/cheat-meals`
Crea un nuevo cheat meal.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "description": "Pizza and ice cream for dinner"
}
```

**Response:** `CheatMealResponse` (201 Created)

**Nota:** Invalida automáticamente feedbacks afectados.

### `GET /api/cheat-meals`
Lista cheat meals (opcionalmente filtrados por fecha).

**Query Parameters:**
- `start_date` (opcional): Fecha de inicio
- `end_date` (opcional): Fecha de fin

**Response:** `List[CheatMealResponse]`

### `GET /api/cheat-meals/{meal_id}`
Obtiene un cheat meal específico.

**Response:** `CheatMealResponse`

### `PUT /api/cheat-meals/{meal_id}`
Actualiza un cheat meal.

**Request Body:** `CheatMealUpdate` (campos opcionales)

**Response:** `CheatMealResponse`

**Nota:** Invalida feedbacks si cambia la fecha.

### `DELETE /api/cheat-meals/{meal_id}`
Elimina un cheat meal.

**Response:** 204 No Content

**Nota:** Invalida automáticamente feedbacks afectados.

---

## Weekly Feedback

### `POST /api/feedback/weekly`
Solicita generación de feedback semanal.

**Request Body:**
```json
{
  "week_start": "2024-01-01",
  "week_end": "2024-01-07"
}
```

**Response:** `WeeklyFeedbackResponse` (201 Created)

**Comportamiento:**
- Crea un job asíncrono para generar el feedback
- Retorna el feedback (inicialmente vacío, se completa por el worker)
- Si ya existe un feedback para esa semana, verifica si está outdated
- Si está en progreso, retorna 202 Accepted

### `GET /api/feedback/weekly`
Lista feedbacks semanales (opcionalmente filtrados por fecha).

**Query Parameters:**
- `start_date` (opcional): Fecha de inicio
- `end_date` (opcional): Fecha de fin

**Response:** `List[WeeklyFeedbackResponse]`

### `GET /api/feedback/weekly/{feedback_id}`
Obtiene un feedback específico.

**Response:** `WeeklyFeedbackResponse`

**Nota:** Verifica automáticamente si el feedback sigue siendo válido.

---

## Características Implementadas

### ✅ Invalidación Automática
Todas las rutas que modifican datos (crear/actualizar/eliminar) invalidan automáticamente los feedbacks afectados usando `invalidate_feedbacks_for_date_range()`.

### ✅ Autenticación JWT
Todas las rutas (excepto `/api/auth/*`) requieren autenticación mediante Bearer token.

### ✅ Validaciones
Los schemas Pydantic validan automáticamente:
- Rangos de fechas
- Rangos de body fat (min < max)
- Valores numéricos (peso, calorías, etc.)

### ✅ Filtrado por Fechas
Las rutas de listado soportan filtrado opcional por `start_date` y `end_date`.

### ✅ Manejo de Archivos
La ruta de fotos maneja upload de archivos y los guarda en el storage configurado.

---

## Próximos Pasos

1. **Workers**: Implementar procesamiento asíncrono de jobs
2. **Domain Logic**: Implementar cálculos determinísticos para feedbacks
3. **AI Services**: Integrar análisis de imágenes y generación de feedback
