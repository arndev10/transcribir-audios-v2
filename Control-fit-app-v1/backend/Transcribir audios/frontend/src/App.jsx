import { useState } from 'react'
import AudioUploader from './components/AudioUploader'
import TranscriptionResult from './components/TranscriptionResult'
import Header from './components/Header'

function App() {
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState(null)

  const handleTranscription = (result) => {
    setTranscription(result.text)
    setLanguage(result.language)
    setError(null)
    setProgress(0)
  }

  const handleError = (err) => {
    setError(err)
    setTranscription('')
    setLanguage(null)
    setProgress(0)
  }

  const handleLoading = (loading) => {
    setIsLoading(loading)
    if (!loading) {
      setProgress(0)
    }
  }

  const handleProgress = (prog) => {
    setProgress(prog)
  }

  const handleClear = () => {
    setTranscription('')
    setLanguage(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-800">
          <h1 className="text-4xl font-serif text-white mb-2">
            Transcribe tu audio.
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            Sube un audio de WhatsApp y obtén su transcripción en texto
          </p>

          <AudioUploader
            onTranscription={handleTranscription}
            onError={handleError}
            onLoading={handleLoading}
            onProgress={handleProgress}
            isLoading={isLoading}
            progress={progress}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 font-medium">Error:</p>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {transcription && (
            <TranscriptionResult
              text={transcription}
              language={language}
              onClear={handleClear}
            />
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Whisper AI • Procesamiento 100% local • Sin costos de API</p>
        </div>
      </main>
    </div>
  )
}

export default App

