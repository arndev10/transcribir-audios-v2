import os
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from whisper_service import WhisperTranscriber

app = FastAPI(
    title="WhatsApp Audio Transcriber",
    description="API para transcribir audios de WhatsApp a texto usando Whisper local",
    version="1.0.0"
)

# Configurar CORS para permitir requests del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar el transcriber (lazy loading)
transcriber = WhisperTranscriber(
    model_size="medium",
    device="auto",
    compute_type="auto"
)

ALLOWED_EXTENSIONS = {".ogg", ".opus", ".mp3", ".wav", ".m4a", ".flac"}

def validate_audio_file(filename: str) -> bool:
    """Valida que el archivo tenga una extensión de audio permitida."""
    if not filename:
        return False
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

@app.get("/")
async def root():
    """Endpoint de salud."""
    return {
        "status": "ok",
        "message": "WhatsApp Audio Transcriber API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Endpoint de salud detallado."""
    return {
        "status": "healthy",
        "model_loaded": transcriber.model is not None,
        "device": transcriber.device,
        "model_size": transcriber.model_size
    }

@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = None,
    model_size: Optional[str] = None
):
    """
    Transcribe un archivo de audio a texto.
    
    Args:
        file: Archivo de audio (.ogg, .opus, .mp3, etc.)
        language: Código de idioma opcional (ej: 'es', 'en'). Si es None, se detecta automáticamente.
        model_size: Tamaño del modelo a usar (opcional, por defecto 'medium')
    
    Returns:
        JSON con el texto transcrito y metadatos
    """
    # Validar archivo
    if not validate_audio_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no soportado. Formatos permitidos: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Crear archivo temporal
    temp_file = None
    try:
        # Leer contenido del archivo
        contents = await file.read()
        
        if len(contents) == 0:
            raise HTTPException(
                status_code=400,
                detail="El archivo de audio está vacío"
            )
        
        # Guardar en archivo temporal
        suffix = Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name
        
        # Cambiar modelo si se especifica
        if model_size and model_size != transcriber.model_size:
            transcriber.model_size = model_size
            transcriber.model = None  # Forzar recarga
        
        # Transcribir
        result = transcriber.transcribe(
            temp_path,
            language=language if language else None
        )
        
        return JSONResponse(content={
            "text": result["text"],
            "language": result["language"],
            "language_probability": result.get("language_probability", 0.0),
            "duration": result.get("duration", 0.0),
            "status": "success"
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al transcribir el audio: {str(e)}"
        )
    finally:
        # Limpiar archivo temporal
        if temp_file and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

