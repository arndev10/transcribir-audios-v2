'use client'

import { useEffect, useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import DailyLogForm from '@/components/DailyLogForm'
import { dailyLogsApi } from '@/lib/api'
import type { DailyLog } from '@/types'
import { groupByWeek, getFirstLogDate, getWeekInfo, calculateDayNumber } from '@/lib/weekUtils'

export default function LogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null)

  const loadLogs = async () => {
    try {
      const response = await dailyLogsApi.list()
      setLogs(response.data)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const firstLogDate = useMemo(() => getFirstLogDate(logs), [logs])
  const logsByWeek = useMemo(() => {
    const grouped = groupByWeek(logs, firstLogDate)
    const sortedWeeks = Array.from(grouped.keys()).sort((a, b) => b - a)
    return sortedWeeks.map(weekNum => ({
      weekNumber: weekNum,
      logs: grouped.get(weekNum)!.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }))
  }, [logs, firstLogDate])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return

    try {
      await dailyLogsApi.delete(id)
      loadLogs()
    } catch (error) {
      console.error('Error deleting log:', error)
      alert('Error al eliminar el registro')
    }
  }

  const handleEdit = (log: DailyLog) => {
    setEditingLog(log)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingLog(null)
    loadLogs()
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
          <h1>Registros Diarios</h1>
          <button
            onClick={() => {
              setEditingLog(null)
              setShowForm(!showForm)
            }}
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
            {showForm ? 'Cancelar' : '+ Nuevo Registro'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <DailyLogForm
              log={editingLog || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false)
                setEditingLog(null)
              }}
            />
          </div>
        )}

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No hay registros aún.</p>
            <p>Comienza agregando tu primer registro diario.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {logsByWeek.map(({ weekNumber, logs: weekLogs }) => {
              const weekInfo = getWeekInfo(weekLogs[0].date, firstLogDate)
              return (
                <div key={weekNumber} style={{ marginBottom: '1rem' }}>
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
                  <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Fecha</th>
                          <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Peso (kg)</th>
                          <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Sueño (h)</th>
                          <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Entrenamiento</th>
                          <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Calorías</th>
                          <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekLogs.map((log) => {
                          const dayNumber = calculateDayNumber(log.date, firstLogDate)
                          return (
                            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ 
                                    backgroundColor: '#0070f3', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    width: '24px', 
                                    height: '24px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold' 
                                  }}>
                                    {dayNumber}
                                  </span>
                                  <span>{new Date(log.date).toLocaleDateString('es-ES')}</span>
                                </div>
                              </td>
                            <td style={{ padding: '1rem' }}>{log.weight ? `${log.weight} kg` : '-'}</td>
                            <td style={{ padding: '1rem' }}>{log.sleep_hours ? `${log.sleep_hours}h` : '-'}</td>
                            <td style={{ padding: '1rem' }}>
                              {log.training_done ? (
                                <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>
                              ) : (
                                <span style={{ color: '#999' }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {log.calories ? (
                                <span>{log.calories} {log.calories_source === 'estimated' && '(est)'}</span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleEdit(log)}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: '#f0f0f0',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(log.id)}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: '#fee',
                                    border: '1px solid #fcc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: '#c00'
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
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
