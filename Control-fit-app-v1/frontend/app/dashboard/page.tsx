'use client'

import { useEffect, useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import WeightChart from '@/components/WeightChart'
import StatsCard from '@/components/StatsCard'
import { dailyLogsApi, profileApi, photosApi, feedbackApi } from '@/lib/api'
import { translateTrainingType, translateActivityLevel } from '@/lib/translations'
import type { DailyLog, ProfileHistory, Photo, WeeklyFeedback } from '@/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedback[]>([])
  const [profile, setProfile] = useState<ProfileHistory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [logsRes, photosRes, feedbacksRes, profileRes] = await Promise.all([
          dailyLogsApi.list(),
          photosApi.list(),
          feedbackApi.list(),
          profileApi.getActive().catch(() => null)
        ])
        setLogs(logsRes.data)
        setPhotos(photosRes.data)
        setFeedbacks(feedbacksRes.data)
        setProfile(profileRes?.data || null)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const stats = useMemo(() => {
    const weightLogs = logs.filter(l => l.weight)
    const recentLogs = logs.slice(0, 7)
    const trainingDays = recentLogs.filter(l => l.training_done).length
    const avgSleep = recentLogs
      .filter(l => l.sleep_hours)
      .reduce((sum, l) => sum + (l.sleep_hours || 0), 0) / recentLogs.filter(l => l.sleep_hours).length || 0

    const firstWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null
    const lastWeight = weightLogs.length > 0 ? weightLogs[0].weight : null
    const weightChange = firstWeight && lastWeight ? lastWeight - firstWeight : null

    return {
      totalLogs: logs.length,
      trainingDays,
      avgSleep: avgSleep > 0 ? avgSleep.toFixed(1) : null,
      weightChange,
      lastWeight,
      photosCount: photos.length,
      feedbacksCount: feedbacks.length
    }
  }, [logs, photos, feedbacks])

  if (loading) {
    return (
      <Layout>
        <p>Cargando...</p>
      </Layout>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatsCard
            title="Total Registros"
            value={stats.totalLogs}
            icon="📊"
          />
          <StatsCard
            title="Última Semana"
            value={`${stats.trainingDays}/7`}
            subtitle="días entrenados"
            icon="💪"
          />
          {stats.avgSleep && (
            <StatsCard
              title="Sueño Promedio"
              value={`${stats.avgSleep}h`}
              subtitle="últimos 7 días"
              icon="😴"
            />
          )}
          {stats.lastWeight && (
            <StatsCard
              title="Peso Actual"
              value={`${stats.lastWeight} kg`}
              subtitle={stats.weightChange ? `Cambio: ${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg` : undefined}
              trend={stats.weightChange ? (stats.weightChange > 0 ? 'up' : 'down') : 'neutral'}
              icon="⚖️"
            />
          )}
          <StatsCard
            title="Fotos"
            value={stats.photosCount}
            icon="📷"
          />
          <StatsCard
            title="Feedbacks"
            value={stats.feedbacksCount}
            icon="📈"
          />
        </div>

        {/* Profile Section */}
        {profile && (
          <section style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Perfil Activo</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Días de entrenamiento:</strong> {profile.training_days_per_week || 'No especificado'}
                  </div>
                  <div>
                    <strong>Tipo de entrenamiento:</strong> {translateTrainingType(profile.training_type)}
                  </div>
                  <div>
                    <strong>Nivel de actividad:</strong> {translateActivityLevel(profile.activity_level)}
                  </div>
                </div>
                {profile.notes && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px' }}>
                    <strong>Notas:</strong> {profile.notes}
                  </div>
                )}
              </div>
              <Link
                href="/profile"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Gestionar Perfil
              </Link>
            </div>
          </section>
        )}

        {/* Weight Chart */}
        {logs.filter(l => l.weight).length > 0 && (
          <section style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <WeightChart logs={logs} />
          </section>
        )}

        {/* Recent Logs */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Últimos Registros</h2>
            <Link
              href="/logs"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              Ver Todos →
            </Link>
          </div>
          {logs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p>No hay registros aún.</p>
              <Link href="/logs" style={{ color: '#0070f3', textDecoration: 'underline' }}>Crear primer registro</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Fecha</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Peso (kg)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Sueño (h)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Entrenamiento</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Calorías</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>{new Date(log.date).toLocaleDateString('es-ES')}</td>
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
                          <span>{log.calories} {log.calories_source === 'estimated' && <span style={{ fontSize: '0.75rem', color: '#666' }}>(est)</span>}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Feedbacks */}
        {feedbacks.length > 0 && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Feedbacks Recientes</h2>
              <Link
                href="/feedback"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Ver Todos →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedbacks.slice(0, 3).map((feedback) => (
                <div
                  key={feedback.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>
                      Semana del {new Date(feedback.week_start).toLocaleDateString('es-ES')} al {new Date(feedback.week_end).toLocaleDateString('es-ES')}
                    </h3>
                  </div>
                  {feedback.avg_weight && (
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#666' }}>
                      <span><strong>Peso promedio:</strong> {feedback.avg_weight} kg</span>
                      {feedback.weight_change && (
                        <span>
                          <strong>Cambio:</strong>{' '}
                          <span style={{ color: feedback.weight_change < 0 ? 'green' : 'red' }}>
                            {feedback.weight_change > 0 ? '+' : ''}{feedback.weight_change} kg
                          </span>
                        </span>
                      )}
                      {feedback.training_days !== undefined && (
                        <span><strong>Días entrenados:</strong> {feedback.training_days}</span>
                      )}
                    </div>
                  )}
                  {feedback.body_fat_trend && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      {feedback.body_fat_trend}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
