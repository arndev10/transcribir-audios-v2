import { useState, useRef, useEffect } from 'react'
import CircularProgress from './CircularProgress'

function AudioUploader({ onTranscription, onError, onLoading, onProgress, isLoading, progress }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const progressIntervalRef = useRef(null)

  const handleFileSelect = (file) => {
    if (file) {
      const validExtensions = ['.ogg', '.opus', '.mp3', '.wav', '.m4a', '.flac']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      
      if (!validExtensions.includes(fileExtension)) {
        onError(`Formato no soportado. Formatos permitidos: ${validExtensions.join(', ')}`)
        return
      }
      
      setSelectedFile(file)
      onError(null)
    }
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Simular progreso durante la transcripción
  useEffect(() => {
    if (isLoading) {
      let currentProgress = 0
      progressIntervalRef.current = setInterval(() => {
        currentProgress += Math.random() * 15
        if (currentProgress > 90) {
          currentProgress = 90 // No llegar al 100% hasta que termine
        }
        if (onProgress) {
          onProgress(currentProgress)
        }
      }, 500)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isLoading, onProgress])

  const handleTranscribe = async () => {
    if (!selectedFile) {
      onError('Por favor, selecciona un archivo de audio')
      return
    }

    onLoading(true)
    onError(null)
    if (onProgress) {
      onProgress(0)
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al transcribir el audio')
      }

      const result = await response.json()
      if (onProgress) {
        onProgress(100)
        setTimeout(() => {
          onTranscription(result)
        }, 300)
      } else {
        onTranscription(result)
      }
    } catch (err) {
      onError(err.message || 'Error al conectar con el servidor. Asegúrate de que el backend esté corriendo.')
      if (onProgress) {
        onProgress(0)
      }
    } finally {
      setTimeout(() => {
        onLoading(false)
      }, 500)
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <CircularProgress progress={progress || 0} size={120} strokeWidth={8} />
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10 scale-105'
                : 'border-gray-700 hover:border-blue-500/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ogg,.opus,.mp3,.wav,.m4a,.flac"
              onChange={handleFileInputChange}
              className="hidden"
              id="audio-file-input"
              disabled={isLoading}
            />
            <label
              htmlFor="audio-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <svg
                className={`w-12 h-12 transition-colors ${
                  isDragging ? 'text-blue-500' : 'text-gray-500'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className={`font-medium text-center ${
                isDragging ? 'text-blue-400' : 'text-gray-300'
              }`}>
                {selectedFile
                  ? selectedFile.name
                  : isDragging
                  ? 'Suelta el archivo aquí'
                  : 'Arrastra un archivo aquí o haz clic para seleccionar'}
              </span>
              {selectedFile && (
                <span className="text-sm text-gray-400">
                  Tamaño: {formatFileSize(selectedFile.size)}
                </span>
              )}
              {!selectedFile && !isDragging && (
                <span className="text-xs text-gray-500 mt-1">
                  Formatos: .ogg, .opus, .mp3, .wav, .m4a, .flac
                </span>
              )}
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-800 border border-gray-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                <span className="text-sm text-gray-300 font-medium">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={handleClearFile}
                className="text-gray-500 hover:text-red-400 transition-colors"
                disabled={isLoading}
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
              </button>
            </div>
          )}

          <button
            onClick={handleTranscribe}
            disabled={!selectedFile || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border disabled:border-gray-700 transition-colors flex items-center justify-center space-x-2"
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
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span>Transcribir Audio</span>
          </button>
        </>
      )}
    </div>
  )
}

export default AudioUploader

