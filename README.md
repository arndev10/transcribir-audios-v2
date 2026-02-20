# WhatsApp Audio Transcriber v2

Web application for transcribing WhatsApp voice messages to text using local Whisper AI. Fully private, zero API costs. Deployed on Render (backend) + Vercel (frontend).

## Features

- Multi-format audio support: OGG, OPUS, MP3, MPEG, WAV, M4A, FLAC
- Automatic language detection
- Local transcription via faster-whisper (no external APIs)
- GPU acceleration support (CUDA)
- Copy to clipboard and download as .txt
- Modern responsive UI

## Tech Stack

**Backend:** Python, FastAPI, faster-whisper, PyTorch, Uvicorn
**Frontend:** React 18, Vite, TailwindCSS

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`

The first run downloads the Whisper model (~75MB for `tiny`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Whisper Model Configuration

Edit `backend/main.py` to change the model size:

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| tiny | ~75MB | Fastest | Basic |
| base | ~142MB | Fast | Good |
| small | ~466MB | Moderate | Better |
| medium | ~1.4GB | Slow | High |
| large-v3 | ~2.9GB | Slowest | Best |

Default is `tiny` for cloud deployment. Use `medium` or larger for local use.

## API

**POST /transcribe** — Transcribe an audio file

```json
{
  "text": "Transcribed text...",
  "language": "es",
  "language_probability": 0.95,
  "duration": 45.2,
  "status": "success"
}
```

**GET /health** — Model info and status

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── whisper_service.py   # Whisper transcription service
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## License

Open source — available for personal and educational use.
