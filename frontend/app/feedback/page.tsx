'use client'

import { useEffect, useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { feedbackApi, jobsApi, dailyLogsApi, getErrorMessage } from '@/lib/api'
import type { WeeklyFeedback, JobStatus } from '@/types'
import { getFirstLogDate, calculateWeekNumber } from '@/lib/weekUtils'

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedback[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [weekStart, setWeekStart] = useState('')
  const [weekEnd, setWeekEnd] = useState('')
  const [error, setError] = useState('')

  const loadFeedbacks = async () => {
    try {
      const response = await feedbackApi.list()
      setFeedbacks(response.data)
    } catch (error) {
      console.error('Error loading feedbacks:', error)
    }
  }

  const loadLogs = async () => {
    try {
      const response = await dailyLogsApi.list()
      setLogs(response.data)
    } catch (error) {
      console.error('Error loading logs:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadFeedbacks(), loadLogs()])
      setLoading(false)
    }
    loadData()
  }, [])

  const firstLogDate = useMemo(() => getFirstLogDate(logs), [logs])
  const feedbacksByWeek = useMemo(() => {
    if (!firstLogDate) return feedbacks.map(f => ({ feedback: f, weekNumber: null }))
    
    return feedbacks.map(feedback => {
      const weekNumber = calculateWeekNumber(feedback.week_start, firstLogDate)
      return { feedback, weekNumber }
    }).sort((a, b) => {
      if (a.weekNumber === null && b.weekNumber === null) return 0
      if (a.weekNumber === null) return 1
      if (b.weekNumber === null) return -1
      return b.weekNumber - a.weekNumber
    })
  }, [feedbacks, firstLogDate])

  const calculateWeekDates = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Monday
    const monday = new Date(today.setDate(diff))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    setWeekStart(monday.toISOString().split('T')[0])
    setWeekEnd(sunday.toISOString().split('T')[0])
  }

  useEffect(() => {
    calculateWeekDates()
  }, [])

  const handleRequestFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weekStart || !weekEnd) {
      setError('Por favor selecciona el rango de fechas')
      return
    }

    setError('')
    setRequesting(true)

    try {
      await feedbackApi.requestWeekly(weekStart, weekEnd)
      alert('Feedback solicitado. Se procesará en background. Recarga la página en unos momentos.')
      setTimeout(() => loadFeedbacks(), 2000)
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Error al solicitar feedback')
    } finally {
      setRequesting(false)
    }
  }

  const checkJobStatus = async (jobId: number) => {
    try {
      const response = await jobsApi.getStatus(jobId)
      return response.data.status
    } catch (error) {
      return 'unknown'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <p>Cargando...</p>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Feedback Semanal</h1>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Solicitar Nuevo Feedback</h2>
          {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}
          
          <form onSubmit={handleRequestFeedback}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                  Inicio de Semana *
                </label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                  Fin de Semana *
                </label>
                <input
                  type="date"
                  value={weekEnd}
                  onChange={(e) => setWeekEnd(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={requesting}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: requesting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {requesting ? 'Solicitando...' : 'Solicitar Feedback'}
            </button>
          </form>
        </div>

        <h2 style={{ marginBottom: '1rem' }}>Feedbacks Generados</h2>

        {feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No hay feedbacks aún.</p>
            <p>Solicita tu primer feedback semanal para comenzar.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {feedbacksByWeek.map(({ feedback, weekNumber }) => (
              <div key={feedback.id}>
                {weekNumber !== null && (
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      backgroundColor: '#0070f3',
                      color: 'white',
                      borderRadius: '8px 8px 0 0',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Semana {weekNumber}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.9 }}>
                      {new Date(feedback.week_start).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(feedback.week_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: weekNumber !== null ? '0 0 8px 8px' : '8px',
                    backgroundColor: 'white'
                  }}
                >
                  {weekNumber === null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>
                          Semana del {new Date(feedback.week_start).toLocaleDateString('es-ES')} al {new Date(feedback.week_end).toLocaleDateString('es-ES')}
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          Generado: {new Date(feedback.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  )}
                  {weekNumber !== null && (
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                      Generado: {new Date(feedback.created_at).toLocaleDateString('es-ES')}
                    </div>
                  )}

                {feedback.avg_weight && (
                  <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Métricas</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div>
                        <strong>Peso promedio:</strong> {feedback.avg_weight} kg
                      </div>
                      {feedback.weight_change && (
                        <div>
                          <strong>Cambio de peso:</strong> {feedback.weight_change > 0 ? '+' : ''}{feedback.weight_change} kg
                        </div>
                      )}
                      {feedback.training_days !== undefined && (
                        <div>
                          <strong>Días de entrenamiento:</strong> {feedback.training_days}
                        </div>
                      )}
                      {feedback.avg_sleep && (
                        <div>
                          <strong>Sueño promedio:</strong> {feedback.avg_sleep} h
                        </div>
                      )}
                      {feedback.total_calories && (
                        <div>
                          <strong>Calorías totales:</strong> {feedback.total_calories}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {feedback.body_fat_trend && (
                  <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Tendencia de Grasa Corporal</h4>
                    <p>{feedback.body_fat_trend}</p>
                  </div>
                )}

                {feedback.overall_interpretation && (
                  <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff9e6', borderRadius: '4px' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Interpretación General</h4>
                    <p>{feedback.overall_interpretation}</p>
                  </div>
                )}

                {!feedback.overall_interpretation && feedback.generation_job_id && (
                  <div style={{ padding: '1rem', backgroundColor: '#fff9e6', borderRadius: '4px', color: '#666' }}>
                    <p>Feedback en proceso. Los análisis interpretativos estarán disponibles cuando se complete el procesamiento.</p>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </Layout>
    </ProtectedRoute>
  )
}
