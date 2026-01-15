import { useState, useEffect } from 'react'

function TranscriptionResult({ text, language, onClear }) {
  const [copied, setCopied] = useState(false)
  const [editedText, setEditedText] = useState(text)

  // Actualizar el texto editado cuando cambia la prop text
  useEffect(() => {
    setEditedText(text)
  }, [text])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([editedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcripcion-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLanguageName = (code) => {
    const languages = {
      es: 'Español',
      en: 'Inglés',
      fr: 'Francés',
      de: 'Alemán',
      it: 'Italiano',
      pt: 'Portugués',
      ja: 'Japonés',
      zh: 'Chino',
      ru: 'Ruso',
      ar: 'Árabe',
    }
    return languages[code] || code
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Transcripción</h2>
        {language && (
          <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
            Idioma detectado: {getLanguageName(language)}
          </span>
        )}
      </div>

      <textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        className="w-full h-64 p-4 border border-gray-700 bg-gray-800 text-white rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        placeholder="La transcripción aparecerá aquí..."
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 bg-gray-800 text-gray-300 border border-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center space-x-2 min-w-[140px]"
        >
          {copied ? (
            <>
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copiar Texto</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 min-w-[140px]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Descargar TXT</span>
        </button>

        <button
          onClick={onClear}
          className="bg-red-900/30 text-red-400 border border-red-800 py-2 px-4 rounded-lg font-medium hover:bg-red-900/50 hover:border-red-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Limpiar</span>
        </button>
      </div>
    </div>
  )
}

export default TranscriptionResult

