import { useEffect, useState } from 'react'

function TranscriptionResult({ text, language, onClear }) {
  const [copied, setCopied] = useState(false)
  const [editedText, setEditedText] = useState(text)

  useEffect(() => {
    setEditedText(text)
  }, [text])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {
      // noop
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
      pt: 'Portugués'
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
          className="flex-1 bg-gray-800 text-gray-300 border border-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          {copied ? '¡Copiado!' : 'Copiar texto'}
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Descargar TXT
        </button>

        <button
          onClick={onClear}
          className="bg-red-900/30 text-red-400 border border-red-800 py-2 px-4 rounded-lg font-medium hover:bg-red-900/50 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}

export default TranscriptionResult
