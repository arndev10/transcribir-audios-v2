# Guía de Pruebas de la API

## Iniciar el Servidor

1. **Asegúrate de tener Python instalado** y las dependencias:
```bash
cd backend
pip install -r requirements.txt
```

2. **Inicia el servidor**:
```bash
uvicorn app.main:app --reload
```

El servidor estará disponible en: `http://localhost:8000`

3. **Documentación interactiva**:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Pruebas Básicas

### 1. Verificar que el servidor está corriendo

```bash
curl http://localhost:8000/
# o
curl http://localhost:8000/health
```

### 2. Registrar un usuario

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 3. Login y obtener token

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=test123"
```

Guarda el `access_token` de la respuesta.

### 4. Obtener usuario actual

```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Crear un perfil

```bash
curl -X POST "http://localhost:8000/api/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "training_days_per_week": 4,
    "training_type": "strength",
    "activity_level": "moderate"
  }'
```

### 6. Crear un daily log

```bash
curl -X POST "http://localhost:8000/api/daily-logs" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "weight": 75.5,
    "sleep_hours": 7.5,
    "training_done": true,
    "calories": 2200,
    "calories_source": "manual"
  }'
```

### 7. Listar daily logs

```bash
curl -X GET "http://localhost:8000/api/daily-logs" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Crear un cheat meal

```bash
curl -X POST "http://localhost:8000/api/cheat-meals" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "description": "Pizza and ice cream"
  }'
```

### 9. Solicitar feedback semanal

```bash
curl -X POST "http://localhost:8000/api/feedback/weekly" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "week_start": "2024-01-01",
    "week_end": "2024-01-07"
  }'
```

## Usando la Documentación Interactiva (Recomendado)

1. Inicia el servidor
2. Abre `http://localhost:8000/docs` en tu navegador
3. Usa la interfaz Swagger para:
   - Ver todas las rutas disponibles
   - Probar endpoints directamente desde el navegador
   - Ver los schemas de request/response
   - Autenticarte usando el botón "Authorize"

## Pruebas con Python (requests)

Crea un archivo `test_requests.py`:

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. Registrar usuario
response = requests.post(f"{BASE_URL}/api/auth/register", json={
    "email": "test@example.com",
    "password": "test123"
})
print("Register:", response.status_code, response.json())

# 2. Login
response = requests.post(
    f"{BASE_URL}/api/auth/login",
    data={"username": "test@example.com", "password": "test123"}
)
token = response.json()["access_token"]
print("Login:", response.status_code)

# 3. Obtener usuario actual
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
print("Me:", response.status_code, response.json())

# 4. Crear perfil
response = requests.post(
    f"{BASE_URL}/api/profile",
    headers=headers,
    json={
        "training_days_per_week": 4,
        "training_type": "strength",
        "activity_level": "moderate"
    }
)
print("Profile:", response.status_code, response.json())

# 5. Crear daily log
response = requests.post(
    f"{BASE_URL}/api/daily-logs",
    headers=headers,
    json={
        "date": "2024-01-15",
        "weight": 75.5,
        "sleep_hours": 7.5,
        "training_done": True,
        "calories": 2200,
        "calories_source": "manual"
    }
)
print("Daily Log:", response.status_code, response.json())

# 6. Listar logs
response = requests.get(f"{BASE_URL}/api/daily-logs", headers=headers)
print("List Logs:", response.status_code, len(response.json()), "logs")
```

## Errores Comunes

### 401 Unauthorized
- Verifica que estés enviando el token en el header `Authorization: Bearer <token>`
- Verifica que el token no haya expirado (30 minutos por defecto)

### 422 Validation Error
- Verifica que los datos enviados cumplan con los schemas
- Revisa los mensajes de error en la respuesta

### 404 Not Found
- Verifica que la ruta sea correcta (debe incluir `/api/`)
- Verifica que el recurso exista (ID válido)

## Verificar Base de Datos

La base de datos SQLite se crea automáticamente en `backend/control_fit.db` cuando inicias el servidor por primera vez.

Puedes inspeccionarla con:
```bash
sqlite3 control_fit.db
.tables
SELECT * FROM users;
```
