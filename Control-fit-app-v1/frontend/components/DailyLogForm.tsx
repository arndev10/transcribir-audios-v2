'use client'

import { useState } from 'react'
import { dailyLogsApi, getErrorMessage } from '@/lib/api'
import type { DailyLog } from '@/types'
import { getLimaDateString, ensureDateString } from '@/lib/dateUtils'

interface DailyLogFormProps {
  log?: DailyLog
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DailyLogForm({ log, onSuccess, onCancel }: DailyLogFormProps) {
  const [date, setDate] = useState(log?.date ? log.date.split('T')[0] : getLimaDateString())
  const [weight, setWeight] = useState(log?.weight?.toString() || '')
  const [sleepHours, setSleepHours] = useState(log?.sleep_hours?.toString() || '')
  const [trainingDone, setTrainingDone] = useState(log?.training_done || false)
  const [calories, setCalories] = useState(log?.calories?.toString() || '')
  const [caloriesSource, setCaloriesSource] = useState(log?.calories_source || 'manual')
  const [notes, setNotes] = useState(log?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data: any = {
        date: ensureDateString(date),
        training_done: trainingDone,
      }

      if (weight) data.weight = parseFloat(weight)
      if (sleepHours) data.sleep_hours = parseFloat(sleepHours)
      if (calories) {
        data.calories = parseInt(calories)
        data.calories_source = caloriesSource
      }
      if (notes) data.notes = notes

      if (log) {
        await dailyLogsApi.update(log.id, data)
      } else {
        await dailyLogsApi.create(data)
      }

      onSuccess?.()
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Error al guardar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <h2>{log ? 'Editar Registro' : 'Nuevo Registro Diario'}</h2>
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
          Peso (kg)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ej: 75.5"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Horas de Sueño
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="24"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
          placeholder="Ej: 7.5"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={trainingDone}
            onChange={(e) => setTrainingDone(e.target.checked)}
          />
          <span style={{ fontWeight: 'bold' }}>Entrenamiento realizado</span>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Calorías
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Ej: 2200"
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <select
            value={caloriesSource}
            onChange={(e) => setCaloriesSource(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="manual">Manual</option>
            <option value="estimated">Estimado</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales..."
          rows={4}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
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
          {loading ? 'Guardando...' : 'Guardar'}
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
