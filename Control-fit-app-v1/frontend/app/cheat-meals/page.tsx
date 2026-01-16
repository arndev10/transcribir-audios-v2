'use client'

import { useEffect, useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { cheatMealsApi, dailyLogsApi } from '@/lib/api'
import type { CheatMeal } from '@/types'
import { groupByWeek, getFirstLogDate, getWeekInfo } from '@/lib/weekUtils'

export default function CheatMealsPage() {
  const [meals, setMeals] = useState<CheatMeal[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadMeals = async () => {
    try {
      const response = await cheatMealsApi.list()
      setMeals(response.data)
    } catch (error) {
      console.error('Error loading cheat meals:', error)
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
      await Promise.all([loadMeals(), loadLogs()])
      setLoading(false)
    }
    loadData()
  }, [])

  const firstLogDate = useMemo(() => getFirstLogDate(logs), [logs])
  const mealsByWeek = useMemo(() => {
    const grouped = groupByWeek(meals, firstLogDate)
    const sortedWeeks = Array.from(grouped.keys()).sort((a, b) => b - a)
    return sortedWeeks.map(weekNum => ({
      weekNumber: weekNum,
      meals: grouped.get(weekNum)!.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }))
  }, [meals, firstLogDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await cheatMealsApi.create({ date, description })
      setShowForm(false)
      setDescription('')
      await loadMeals()
    } catch (error) {
      console.error('Error creating cheat meal:', error)
      alert('Error al crear la comida trampa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta comida trampa?')) return

    try {
      await cheatMealsApi.delete(id)
      loadMeals()
    } catch (error) {
      console.error('Error deleting cheat meal:', error)
      alert('Error al eliminar')
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Comidas Trampa</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showForm ? 'Cancelar' : '+ Nueva Comida Trampa'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <form onSubmit={handleSubmit}>
              <h2 style={{ marginBottom: '1rem' }}>Nueva Comida Trampa</h2>
              
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
                  Descripción *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la comida trampa (ej: Pizza y helado para la cena)"
                  required
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setDescription('')
                  }}
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
              </div>
            </form>
          </div>
        )}

        {meals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No hay comidas trampa registradas aún.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {mealsByWeek.map(({ weekNumber, meals: weekMeals }) => {
              const weekInfo = getWeekInfo(weekMeals[0].date, firstLogDate)
              return (
                <div key={weekNumber}>
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
                      {weekInfo.weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {weekInfo.weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '1rem' }}>
                    {weekMeals.map((meal) => (
                      <div
                        key={meal.id}
                        style={{
                          padding: '1.5rem',
                          border: '1px solid #eee',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {new Date(meal.date).toLocaleDateString('es-ES')}
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>{meal.description}</div>
                          {meal.estimated_impact && (
                            <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f0f8ff', borderRadius: '4px', fontSize: '0.9rem', color: '#666' }}>
                              <strong>Impacto estimado:</strong> {meal.estimated_impact}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#fee',
                            border: '1px solid #fcc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#c00',
                            fontSize: '0.875rem'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </Layout>
    </ProtectedRoute>
  )
}
