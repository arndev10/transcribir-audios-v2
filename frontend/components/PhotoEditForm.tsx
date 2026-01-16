'use client'

import { useState, useEffect } from 'react'
import { photosApi, getErrorMessage } from '@/lib/api'
import type { Photo } from '@/types'

interface PhotoEditFormProps {
  photo: Photo
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PhotoEditForm({ photo, onSuccess, onCancel }: PhotoEditFormProps) {
  const [date, setDate] = useState(photo.date.split('T')[0])
  const [isBestState, setIsBestState] = useState(photo.is_best_state || false)
  const [userNotes, setUserNotes] = useState(photo.user_notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await photosApi.update(photo.id, {
        date,
        is_best_state: isBestState,
        user_notes: userNotes || undefined
      })
      onSuccess?.()
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Error al actualizar la foto')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBestState = async () => {
    setError('')
    setLoading(true)

    try {
      await photosApi.update(photo.id, {
        is_best_state: !isBestState
      })
      setIsBestState(!isBestState)
      onSuccess?.()
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Error al actualizar la foto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <h2>Editar Foto</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          {error}
        </div>
      )}

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
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={isBestState}
            onChange={(e) => setIsBestState(e.target.checked)}
          />
          <span style={{ fontWeight: 'bold' }}>Mejor estado físico</span>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Notas
        </label>
        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Notas sobre esta foto..."
          rows={4}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button
          type="button"
          onClick={handleToggleBestState}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isBestState ? '#4caf50' : '#f0f0f0',
            color: isBestState ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isBestState ? '⭐ Mejor Estado' : 'Marcar como Mejor Estado'}
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
