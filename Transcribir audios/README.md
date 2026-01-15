# WhatsApp Audio Transcriber 🎤→📝

MVP funcional de una aplicación web para transcribir audios de WhatsApp a texto usando Whisper local. Procesamiento 100% local, sin costos de API ni tokens.

## 🎯 Características

- ✅ Subida de audios en formatos `.ogg`, `.opus`, `.mp3`, `.wav`, `.m4a`, `.flac`
- ✅ Transcripción a texto usando Whisper local (faster-whisper)
- ✅ Detección automática de idioma
- ✅ Interfaz web moderna y responsive
- ✅ Copiar texto al portapapeles
- ✅ Descargar transcripción como archivo `.txt`
- ✅ Procesamiento 100% local (sin APIs externas)
- ✅ Optimización para GPU (CUDA) cuando está disponible

## 🧠 Tecnologías Usadas

### Backend
- **Python 3.10+**
- **FastAPI** - Framework web moderno y rápido
- **faster-whisper** - Implementación optimizada de Whisper
- **PyTorch** - Para soporte GPU/CUDA
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework CSS utility-first

## 📁 Estructura del Proyecto

```
whatsapp-audio-to-text/
├── backend/
│   ├── main.py              # API FastAPI principal
│   ├── whisper_service.py   # Servicio de transcripción Whisper
│   └── requirements.txt     # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── App.jsx         # Componente principal
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Estilos globales
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 🚀 Cómo Ejecutar

### Prerrequisitos

- Python 3.10 o superior
- Node.js 18+ y npm
- (Opcional) CUDA toolkit si quieres usar GPU

### Backend

1. Navega a la carpeta `backend`:
```bash
cd backend
```

2. Crea un entorno virtual (recomendado):
```bash
python -m venv venv
```

3. Activa el entorno virtual:
   - Windows:
   ```bash
   venv\Scripts\activate
   ```
   - Linux/Mac:
   ```bash
   source venv/bin/activate
   ```

4. Instala las dependencias:
```bash
pip install -r requirements.txt
```

5. Ejecuta el servidor:
```bash
python main.py
```

El backend estará disponible en `http://localhost:8000`

**Nota**: La primera vez que ejecutes, faster-whisper descargará el modelo Whisper (modelo `medium` por defecto, ~1.4GB). Esto puede tardar unos minutos.

### Frontend

1. Navega a la carpeta `frontend`:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📖 Uso

1. Abre `http://localhost:5173` en tu navegador
2. Haz clic en el área de carga y selecciona un archivo de audio
3. Haz clic en "Transcribir Audio"
4. Espera a que se complete la transcripción (puede tardar según la duración del audio)
5. Copia el texto o descárgalo como archivo `.txt`

## ⚙️ Configuración

### Cambiar el Modelo de Whisper

En `backend/main.py`, puedes cambiar el tamaño del modelo:

```python
transcriber = WhisperTranscriber(
    model_size="large-v3",  # Opciones: tiny, base, small, medium, large-v2, large-v3
    device="auto",
    compute_type="auto"
)
```

**Modelos disponibles:**
- `tiny` - Más rápido, menos preciso (~75MB)
- `base` - Balance velocidad/precisión (~142MB)
- `small` - Buen balance (~466MB)
- `medium` - Mejor precisión (~1.4GB) - **Recomendado**
- `large-v2` - Máxima precisión (~2.9GB)
- `large-v3` - Última versión large (~2.9GB)

### Forzar CPU o GPU

En `backend/main.py`:

```python
transcriber = WhisperTranscriber(
    model_size="medium",
    device="cuda",  # o "cpu"
    compute_type="float16"  # o "int8" para CPU
)
```

## 🧪 Endpoints API

### `GET /`
Endpoint de salud básico.

### `GET /health`
Endpoint de salud detallado con información del modelo.

### `POST /transcribe`
Transcribe un archivo de audio.

**Request:**
- `file`: Archivo de audio (multipart/form-data)
- `language` (opcional): Código de idioma (ej: `es`, `en`)

**Response:**
```json
{
  "text": "Texto transcrito completo...",
  "language": "es",
  "language_probability": 0.95,
  "duration": 45.2,
  "status": "success"
}
```

## 🎨 Por Qué Whisper Local?

1. **Costo Cero**: No hay costos de API ni tokens
2. **Privacidad**: Todo el procesamiento es local, tus audios nunca salen de tu máquina
3. **Sin Límites**: No hay límites de uso ni rate limiting
4. **Offline**: Funciona sin conexión a internet
5. **Control Total**: Puedes ajustar parámetros y modelos según tus necesidades

## 🗺️ Roadmap

- [ ] Resumen automático de textos largos usando modelos locales
- [ ] Soporte para múltiples archivos en batch
- [ ] Historial de transcripciones
- [ ] Exportación a diferentes formatos (PDF, DOCX)
- [ ] Versión desktop con Tauri
- [ ] Mejoras en la UI/UX
- [ ] Soporte para timestamps en la transcripción
- [ ] Detección de múltiples hablantes

## 🐛 Solución de Problemas

### Error: "CUDA out of memory"
- Reduce el tamaño del modelo (usa `small` o `base` en lugar de `medium`)
- O fuerza el uso de CPU: `device="cpu"`

### Error: "Model not found"
- La primera ejecución descarga el modelo automáticamente
- Asegúrate de tener conexión a internet la primera vez
- El modelo se guarda en `~/.cache/huggingface/`

### El backend no responde
- Verifica que el puerto 8000 esté libre
- Revisa los logs del servidor para errores
- Asegúrate de que todas las dependencias estén instaladas

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Revisa la consola del navegador para errores CORS
- Asegúrate de que el proxy en `vite.config.js` esté configurado correctamente

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso en portfolio profesional.

## 👨‍💻 Autor

Desarrollado como MVP para demostración en portfolio profesional.

---

**Nota**: Este es un MVP funcional. Para producción, considera agregar validaciones adicionales, manejo de errores más robusto, autenticación, y optimizaciones de rendimiento.

