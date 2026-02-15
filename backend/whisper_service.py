from typing import Optional
from faster_whisper import WhisperModel


class WhisperTranscriber:
    def __init__(self, model_size: str = "medium", device: str = "auto", compute_type: str = "auto"):
        self.model_size = model_size
        self.device = device if device != "auto" else ("cuda" if self._check_cuda() else "cpu")
        self.compute_type = compute_type if compute_type != "auto" else self._get_optimal_compute_type()
        self.model = None

    def _check_cuda(self) -> bool:
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False

    def _get_optimal_compute_type(self) -> str:
        return "float16" if self.device == "cuda" else "int8"

    def load_model(self):
        if self.model is None:
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type
            )

    def transcribe(self, audio_path: str, language: Optional[str] = None, **kwargs) -> dict:
        self.load_model()
        segments, info = self.model.transcribe(audio_path, language=language, **kwargs)
        text_segments = [s.text.strip() for s in segments]
        full_text = " ".join(text_segments)
        return {
            "text": full_text,
            "language": info.language,
            "language_probability": getattr(info, "language_probability", 0.0),
            "duration": getattr(info, "duration", 0.0)
        }
