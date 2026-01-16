# Control Fit Frontend

Frontend Next.js para la aplicación de monitoreo de grasa corporal y peso.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (opcional):
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout principal con navegación
│   ├── page.tsx            # Página principal
│   ├── login/              # Página de login
│   ├── register/           # Página de registro
│   ├── dashboard/          # Dashboard principal
│   ├── logs/               # Registros diarios
│   ├── photos/             # Gestión de fotos
│   ├── cheat-meals/        # Comidas trampa
│   ├── feedback/           # Feedback semanal
│   └── profile/            # Perfil de usuario
├── components/             # Componentes React
│   ├── Layout.tsx          # Layout con navegación
│   ├── ProtectedRoute.tsx  # Protección de rutas
│   ├── DailyLogForm.tsx    # Formulario de registros
│   ├── PhotoUpload.tsx     # Subida de fotos
│   ├── PhotoEditForm.tsx   # Edición de fotos
│   ├── PhotoThumbnail.tsx  # Miniatura de foto
│   ├── PhotoViewer.tsx     # Visor de foto completa
│   ├── WeightChart.tsx     # Gráfico de peso
│   └── StatsCard.tsx       # Tarjeta de estadísticas
├── lib/                    # Utilidades y helpers
│   ├── api.ts              # Cliente API (Axios)
│   ├── auth.ts             # Utilidades de autenticación
│   ├── dateUtils.ts        # Utilidades de fechas (timezone Lima)
│   ├── weekUtils.ts        # Utilidades de semanas y días
│   └── translations.ts     # Traducciones
├── types/                  # TypeScript types
│   └── index.ts            # Definiciones de tipos
└── middleware.ts           # Middleware de Next.js
```

## ✨ Características

### Funcionalidades Principales

- ✅ **Autenticación**: Login y registro con JWT
- ✅ **Dashboard**: Vista general con estadísticas y gráficos
- ✅ **Registros Diarios**: 
  - Registro de peso, sueño, entrenamiento y calorías
  - Organización por semanas
  - Numeración de días (1-7 por semana)
  - Edición y eliminación
- ✅ **Fotos Corporales**:
  - Subida de fotos con preview
  - Visualización de miniaturas
  - Modal para ver foto completa
  - Edición de fotos (fecha, notas, mejor estado físico)
  - Marcado de "Mejor estado físico"
- ✅ **Comidas Trampa**: Registro y visualización
- ✅ **Feedback Semanal**: Solicitud y visualización de feedbacks
- ✅ **Perfil**: Gestión de perfiles de entrenamiento

### Características Técnicas

- ✅ **Rutas Protegidas**: Middleware y componente ProtectedRoute
- ✅ **Manejo de Errores**: Parsing mejorado de errores del backend
- ✅ **Timezone**: Soporte para timezone de Lima, Perú
- ✅ **Organización por Semanas**: Separadores visuales por semana
- ✅ **Indicadores Visuales**: Pestaña activa resaltada en navegación
- ✅ **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Autenticación

Los tokens JWT se almacenan en `localStorage`. El cliente API (Axios) agrega automáticamente el token a las peticiones.

## 📦 Dependencias Principales

- `next`: Framework React
- `react`: Biblioteca UI
- `axios`: Cliente HTTP
- `chart.js`: Gráficos
- `react-chartjs-2`: Wrapper de Chart.js para React

## 🎨 Estilos

Los estilos están definidos inline usando objetos de estilo de React. Esto permite un diseño rápido y mantenible sin necesidad de archivos CSS adicionales.

## 🔐 Seguridad

- Las rutas protegidas verifican autenticación antes de renderizar
- Los tokens se validan en cada petición al backend
- Manejo seguro de errores de autenticación (redirección a login)
