<<<<<<< HEAD
# Control Fit - Aplicación de Monitoreo de Grasa Corporal y Peso

Aplicación web para monitoreo de grasa corporal y peso, enfocada en ayudar a los usuarios a interpretar su progreso físico a lo largo del tiempo.

## 🎯 Objetivo

El objetivo principal **no es la pérdida de peso en sí**, sino entender cómo la grasa corporal, inflamación, retención de líquidos y consistencia afectan el progreso percibido.

El sistema prioriza:
- **Tendencias a largo plazo** sobre fluctuaciones diarias
- **Explicabilidad** sobre prescripciones
- **Análisis controlado por el usuario** sobre procesamiento automático

## 🏗️ Arquitectura

```
Frontend (Next.js) → Backend API (FastAPI) → SQLite/PostgreSQL
```

### Stack Tecnológico

- **Frontend**: Next.js 14, TypeScript, React
- **Backend**: FastAPI, Python 3.11+
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: JWT
- **Procesamiento Asíncrono**: Background Tasks

## 📁 Estructura del Proyecto

```
control-fit-app-v1/
├── backend/          # API FastAPI
│   ├── app/          # Código de la aplicación
│   ├── storage/      # Almacenamiento de fotos
│   └── requirements.txt
├── frontend/         # Aplicación Next.js
│   ├── app/          # Páginas y rutas
│   ├── components/   # Componentes React
│   └── lib/          # Utilidades y helpers
└── ARCHITECTURE.md   # Documentación de arquitectura
```
=======
# Control Fit Backend

Backend API para la aplicación de monitoreo de grasa corporal y peso.
>>>>>>> 143e50c803246db2158888911cc03e86d7f7ea4f

## 🚀 Inicio Rápido

### Prerrequisitos

- Python 3.11+
<<<<<<< HEAD
- Node.js 18+
- npm o yarn

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Crear entorno virtual:
=======
- pip

### Instalación

1. Crear un entorno virtual:
>>>>>>> 143e50c803246db2158888911cc03e86d7f7ea4f
```bash
python -m venv venv
```

<<<<<<< HEAD
3. Activar entorno virtual:
=======
2. Activar el entorno virtual:
>>>>>>> 143e50c803246db2158888911cc03e86d7f7ea4f
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

<<<<<<< HEAD
4. Instalar dependencias:
=======
3. Instalar dependencias:
>>>>>>> 143e50c803246db2158888911cc03e86d7f7ea4f
```bash
pip install -r requirements.txt
```

<<<<<<< HEAD
5. Iniciar servidor:
=======
4. Crear archivo `.env` (opcional):
```env
DATABASE_URL=sqlite:///./control_fit.db
SECRET_KEY=your-secret-key-here
PHOTOS_STORAGE_PATH=./storage/photos
```

5. Ejecutar la aplicación:
>>>>>>> 143e50c803246db2158888911cc03e86d7f7ea4f
```bash
# Windows
start.bat

# O manualmente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

<<<<<<< HEAD
La API estará disponible en `http://localhost:8001`
Documentación Swagger: `http://localhost:8001/docs`

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (opcional):
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura detallada del proyecto
- [backend/README.md](./backend/README.md) - Documentación del backend
- [frontend/README.md](./frontend/README.md) - Documentación del frontend
- [backend/API_ROUTES.md](./backend/API_ROUTES.md) - Documentación de rutas API

## ✨ Características Principales

### Para Usuarios

- ✅ Registro diario de peso, sueño, entrenamiento y calorías
- ✅ Subida y visualización de fotos corporales con miniaturas
- ✅ Registro de comidas trampa (cheat meals)
- ✅ Feedback semanal generado bajo demanda
- ✅ Visualización de tendencias con gráficos
- ✅ Gestión de perfiles de entrenamiento versionados
- ✅ Organización por semanas con numeración de días
- ✅ Indicadores visuales de pestaña activa
- ✅ Edición de fotos con marcado de "Mejor estado físico"

### Técnicas

- ✅ Autenticación JWT
- ✅ Procesamiento asíncrono de tareas
- ✅ Invalidación automática de feedbacks cuando cambian los datos
- ✅ Almacenamiento local de fotos
- ✅ Validaciones robustas en backend y frontend
- ✅ Manejo de errores mejorado
- ✅ Soporte para timezone (Lima, Perú)

## 🔐 Autenticación

La aplicación usa JWT (JSON Web Tokens) para autenticación. Los tokens se almacenan en `localStorage` del navegador.

## 📊 Modelo de Datos

- **User**: Usuarios del sistema
- **ProfileHistory**: Perfiles de entrenamiento versionados
- **DailyLog**: Registros diarios de peso, sueño, entrenamiento, calorías
- **Photo**: Fotos corporales con estimación de grasa corporal
- **CheatMeal**: Comidas trampa con descripción cualitativa
- **WeeklyFeedback**: Feedback semanal generado bajo demanda
- **Job**: Trabajos asíncronos para procesamiento en background

## 🧪 Testing

Ver [backend/TESTING.md](./backend/TESTING.md) para información sobre testing.

## 📝 Licencia

Este proyecto es privado.

## 👤 Autor

Arndev10

## 🔗 Enlaces

- Repositorio: https://github.com/arndev10/Arndev-projects/tree/main/Control%20fit%20app%20v1
=======
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
>>>>>>> 143e50c803246db2158888911cc03e86d7f7ea4f
