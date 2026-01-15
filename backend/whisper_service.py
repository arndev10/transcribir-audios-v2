import os
import tempfile
from pathlib import Path
from typing import Optional
from faster_whisper import WhisperModel

class WhisperTranscriber:
    def __init__(self, model_size: str = "medium", device: str = "auto", compute_type: str = "auto"):
        """
        Inicializa el modelo Whisper para transcripción.
        
        Args:
            model_size: Tamaño del modelo ('tiny', 'base', 'small', 'medium', 'large-v2', 'large-v3')
            device: Dispositivo a usar ('cpu', 'cuda', 'auto')
            compute_type: Tipo de computación ('int8', 'int8_float16', 'int16', 'float16', 'float32', 'auto')
        """
        self.model_size = model_size
        self.device = device if device != "auto" else ("cuda" if self._check_cuda() else "cpu")
        self.compute_type = compute_type if compute_type != "auto" else self._get_optimal_compute_type()
        self.model = None
        
    def _check_cuda(self) -> bool:
        """Verifica si CUDA está disponible."""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
    
    def _get_optimal_compute_type(self) -> str:
        """Determina el tipo de computación óptimo según el dispositivo."""
        if self.device == "cuda":
            return "float16"
        return "int8"
    
    def load_model(self):
        """Carga el modelo Whisper (lazy loading)."""
        if self.model is None:
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type
            )
    
    def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
        task: str = "transcribe",
        beam_size: int = 5,
        best_of: int = 5,
        patience: float = 1.0,
        length_penalty: float = 1.0,
        temperature: float = 0.0,
        compression_ratio_threshold: float = 2.4,
        log_prob_threshold: float = -1.0,
        no_speech_threshold: float = 0.6,
        condition_on_previous_text: bool = True,
        initial_prompt: Optional[str] = None,
        word_timestamps: bool = False,
        prepend_punctuations: str = '"\'¿([{-',
        append_punctuations: str = '"\'.,!?::")]}、',
        vad_filter: bool = True,
        vad_parameters: Optional[dict] = None
    ) -> dict:
        """
        Transcribe un archivo de audio.
        
        Args:
            audio_path: Ruta al archivo de audio
            language: Código de idioma (ej: 'es', 'en', None para auto-detección)
            task: 'transcribe' o 'translate'
            beam_size: Tamaño del beam search
            best_of: Número de candidatos a considerar
            patience: Patience para beam search
            length_penalty: Penalización por longitud
            temperature: Temperatura para sampling
            compression_ratio_threshold: Umbral de ratio de compresión
            log_prob_threshold: Umbral de probabilidad logarítmica
            no_speech_threshold: Umbral para detectar ausencia de voz
            condition_on_previous_text: Si condicionar en texto previo
            initial_prompt: Prompt inicial para guiar la transcripción
            word_timestamps: Si incluir timestamps por palabra
            prepend_punctuations: Puntuación a prepender
            append_punctuations: Puntuación a append
            vad_filter: Si usar filtro VAD (Voice Activity Detection)
            vad_parameters: Parámetros para VAD
            
        Returns:
            dict con 'text' (texto transcrito) y 'language' (idioma detectado)
        """
        self.load_model()
        
        segments, info = self.model.transcribe(
            audio_path,
            language=language,
            task=task,
            beam_size=beam_size,
            best_of=best_of,
            patience=patience,
            length_penalty=length_penalty,
            temperature=temperature,
            compression_ratio_threshold=compression_ratio_threshold,
            log_prob_threshold=log_prob_threshold,
            no_speech_threshold=no_speech_threshold,
            condition_on_previous_text=condition_on_previous_text,
            initial_prompt=initial_prompt,
            word_timestamps=word_timestamps,
            prepend_punctuations=prepend_punctuations,
            append_punctuations=append_punctuations,
            vad_filter=vad_filter,
            vad_parameters=vad_parameters
        )
        
        text_segments = []
        for segment in segments:
            text_segments.append(segment.text.strip())
        
        full_text = " ".join(text_segments)
        
        return {
            "text": full_text,
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration
        }

