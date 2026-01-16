# Control Fit Backend

Backend API para la aplicación de monitoreo de grasa corporal y peso.

## 🚀 Inicio Rápido

### Prerrequisitos

- Python 3.11+
- pip

### Instalación

1. Crear un entorno virtual:
```bash
python -m venv venv
```

2. Activar el entorno virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Crear archivo `.env` (opcional):
```env
DATABASE_URL=sqlite:///./control_fit.db
SECRET_KEY=your-secret-key-here
PHOTOS_STORAGE_PATH=./storage/photos
```

5. Ejecutar la aplicación:
```bash
# Windows
start.bat

# O manualmente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

La API estará disponible en:
- **API**: `http://localhost:8001`
- **Documentación Swagger**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

## 📁 Estructura

```
backend/
├── app/
│   ├── main.py          # Entrypoint de FastAPI
│   ├── config.py        # Configuración y variables de entorno
│   ├── db/              # Modelos y configuración de base de datos
│   │   ├── models.py    # Modelos SQLAlchemy
│   │   ├── session.py   # Sesión de base de datos
│   │   └── base.py      # Base para modelos
│   ├── api/             # Rutas HTTP
│   │   ├── routes/      # Endpoints por módulo
│   │   └── deps.py      # Dependencias comunes (auth, db)
│   ├── domain/          # Lógica de negocio
│   │   ├── trend_analysis.py
│   │   ├── body_analysis.py
│   │   ├── feedback_engine.py
│   │   └── feedback_helpers.py
│   ├── services/         # Servicios externos (AI, storage)
│   │   ├── image_analysis.py
│   │   ├── llm_service.py
│   │   └── storage_service.py
│   ├── workers/         # Procesos asíncronos
│   │   └── tasks.py
│   └── schemas/          # Schemas de Pydantic
├── storage/              # Almacenamiento de fotos
└── requirements.txt      # Dependencias Python
```

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Información del usuario actual

### Perfiles
- `GET /api/profile/active` - Perfil activo
- `POST /api/profile` - Crear nuevo perfil
- `GET /api/profile` - Listar perfiles

### Registros Diarios
- `GET /api/daily-logs` - Listar registros
- `POST /api/daily-logs` - Crear registro
- `PUT /api/daily-logs/{id}` - Actualizar registro
- `DELETE /api/daily-logs/{id}` - Eliminar registro

### Fotos
- `GET /api/photos` - Listar fotos
- `POST /api/photos` - Subir foto
- `GET /api/photos/{id}/file` - Obtener archivo de foto
- `PUT /api/photos/{id}` - Actualizar foto
- `DELETE /api/photos/{id}` - Eliminar foto

### Comidas Trampa
- `GET /api/cheat-meals` - Listar comidas trampa
- `POST /api/cheat-meals` - Crear comida trampa
- `PUT /api/cheat-meals/{id}` - Actualizar
- `DELETE /api/cheat-meals/{id}` - Eliminar

### Feedback Semanal
- `GET /api/feedback/weekly` - Listar feedbacks
- `POST /api/feedback/weekly` - Solicitar feedback
- `GET /api/feedback/weekly/{id}` - Obtener feedback específico

### Jobs (Trabajos Asíncronos)
- `GET /api/jobs` - Listar jobs
- `GET /api/jobs/{id}` - Obtener job
- `GET /api/jobs/{id}/status` - Estado del job

## 🔐 Autenticación

Todos los endpoints (excepto registro y login) requieren autenticación JWT. Incluir el token en el header:

```
Authorization: Bearer <token>
```

## 📊 Base de Datos

Por defecto usa SQLite (`control_fit.db`). Para producción, configurar PostgreSQL en `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost/control_fit
```

## 🧪 Testing

Ver [TESTING.md](./TESTING.md) para información sobre testing.

## 📝 Documentación Adicional

- [API_ROUTES.md](./API_ROUTES.md) - Documentación detallada de rutas
- [QUICK_START.md](./QUICK_START.md) - Guía de inicio rápido
- [VALIDATIONS_SUMMARY.md](./VALIDATIONS_SUMMARY.md) - Resumen de validaciones
