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

## 🚀 Inicio Rápido

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- npm o yarn

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Crear entorno virtual:
```bash
python -m venv venv
```

3. Activar entorno virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Instalar dependencias:
```bash
pip install -r requirements.txt
```

5. Iniciar servidor:
```bash
# Windows
start.bat

# O manualmente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

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
