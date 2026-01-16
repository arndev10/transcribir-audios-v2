'use client'

import { useState } from 'react'
import { photosApi, getErrorMessage } from '@/lib/api'
import { getLimaDateString } from '@/lib/dateUtils'

interface PhotoUploadProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PhotoUpload({ onSuccess, onCancel }: PhotoUploadProps) {
  const [date, setDate] = useState(getLimaDateString())
  const [file, setFile] = useState<File | null>(null)
  const [isBestState, setIsBestState] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Por favor selecciona una foto')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Verificar que hay token antes de subir
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión nuevamente.')
        setLoading(false)
        return
      }
      console.log('Subiendo foto con token:', token.substring(0, 20) + '...')
      console.log('Datos a enviar:', { date, isBestState, notes, fileName: file.name })
      await photosApi.upload(file, date, isBestState, notes || undefined)
      onSuccess?.()
    } catch (err: any) {
      console.error('Error al subir foto:', err)
      console.error('Error response:', err.response)
      setError(getErrorMessage(err) || 'Error al subir la foto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <h2>Subir Foto Corporal</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Fecha *
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Foto *
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        {preview && (
          <div style={{ marginTop: '1rem' }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={isBestState}
            onChange={(e) => setIsBestState(e.target.checked)}
          />
          <span style={{ fontWeight: 'bold' }}>Marcar como mejor estado físico</span>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas sobre esta foto..."
          rows={3}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading || !file}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Subiendo...' : 'Subir Foto'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
