'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { profileApi } from '@/lib/api'
import { translateTrainingType, translateActivityLevel } from '@/lib/translations'
import type { ProfileHistory } from '@/types'

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<ProfileHistory[]>([])
  const [activeProfile, setActiveProfile] = useState<ProfileHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    initial_weight: '',
    training_days_per_week: '',
    training_type: '',
    activity_level: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadProfiles = async () => {
    try {
      const [listRes, activeRes] = await Promise.all([
        profileApi.list(),
        profileApi.getActive().catch(() => null)
      ])
      setProfiles(listRes.data)
      setActiveProfile(activeRes?.data || null)
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const data: any = {}
      if (formData.age) data.age = parseInt(formData.age)
      if (formData.height) data.height = parseFloat(formData.height)
      if (formData.initial_weight) data.initial_weight = parseFloat(formData.initial_weight)
      if (formData.training_days_per_week) data.training_days_per_week = parseInt(formData.training_days_per_week)
      if (formData.training_type) data.training_type = formData.training_type
      if (formData.activity_level) data.activity_level = formData.activity_level
      if (formData.notes) data.notes = formData.notes

      await profileApi.create(data)
      setShowForm(false)
      setFormData({ age: '', height: '', initial_weight: '', training_days_per_week: '', training_type: '', activity_level: '', notes: '' })
      loadProfiles()
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Error al crear el perfil')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1>Perfiles de Entrenamiento</h1>
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
                {showForm ? 'Cancelar' : '+ Nuevo Perfil'}
              </button>
            </div>

            {showForm && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '1rem' }}>Crear Nuevo Perfil</h2>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  Los perfiles son versionados. Cada cambio crea un nuevo snapshot, preservando el historial.
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#666' }}>Información Básica</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                          Edad (años)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                          Altura (cm)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="250"
                          step="0.1"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                          Peso Inicial (kg)
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="300"
                          step="0.1"
                          value={formData.initial_weight}
                          onChange={(e) => setFormData({ ...formData, initial_weight: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#666' }}>Contexto de Entrenamiento</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                          Días de Entrenamiento por Semana
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="7"
                          value={formData.training_days_per_week}
                          onChange={(e) => setFormData({ ...formData, training_days_per_week: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                          Tipo de Entrenamiento
                        </label>
                        <select
                          value={formData.training_type}
                          onChange={(e) => setFormData({ ...formData, training_type: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="strength">Fuerza</option>
                          <option value="cardio">Cardio</option>
                          <option value="mixed">Mixto</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                          Nivel de Actividad
                        </label>
                        <select
                          value={formData.activity_level}
                          onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="sedentary">Sedentario</option>
                          <option value="moderate">Moderado</option>
                          <option value="active">Activo</option>
                          <option value="very_active">Muy Activo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                      Notas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notas sobre tu contexto de entrenamiento..."
                      rows={4}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#0070f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {submitting ? 'Creando...' : 'Crear Perfil'}
                  </button>
                </form>
              </div>
            )}

            {activeProfile && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#e8f4f8', border: '2px solid #0070f3', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, color: '#0070f3' }}>⭐ Perfil Activo (Más Reciente)</h2>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Creado: {new Date(activeProfile.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {activeProfile.age && (
                    <div>
                      <strong>Edad:</strong> {activeProfile.age} años
                    </div>
                  )}
                  {activeProfile.height && (
                    <div>
                      <strong>Altura:</strong> {activeProfile.height} cm
                    </div>
                  )}
                  {activeProfile.initial_weight && (
                    <div>
                      <strong>Peso inicial:</strong> {activeProfile.initial_weight} kg
                    </div>
                  )}
                  <div>
                    <strong>Días de entrenamiento:</strong> {activeProfile.training_days_per_week || 'No especificado'}
                  </div>
                  <div>
                    <strong>Tipo de entrenamiento:</strong> {translateTrainingType(activeProfile.training_type)}
                  </div>
                  <div>
                    <strong>Nivel de actividad:</strong> {translateActivityLevel(activeProfile.activity_level)}
                  </div>
                </div>
                {activeProfile.notes && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px' }}>
                    <strong>Notas:</strong> {activeProfile.notes}
                  </div>
                )}
              </div>
            )}

            <h2 style={{ marginBottom: '1rem' }}>Historial de Perfiles</h2>
            {profiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p>No hay perfiles aún.</p>
                <p>Crea tu primer perfil de entrenamiento.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: profile.id === activeProfile?.id ? '#f0f8ff' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {profile.id === activeProfile?.id && '⭐ '}
                    Perfil #{profile.id}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {new Date(profile.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                  {profile.age && (
                    <div>
                      <strong>Edad:</strong> {profile.age} años
                    </div>
                  )}
                  {profile.height && (
                    <div>
                      <strong>Altura:</strong> {profile.height} cm
                    </div>
                  )}
                  {profile.initial_weight && (
                    <div>
                      <strong>Peso inicial:</strong> {profile.initial_weight} kg
                    </div>
                  )}
                  <div>
                    <strong>Días/semana:</strong> {profile.training_days_per_week || '-'}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {translateTrainingType(profile.training_type)}
                  </div>
                  <div>
                    <strong>Actividad:</strong> {translateActivityLevel(profile.activity_level)}
                  </div>
                </div>
                {profile.notes && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px', fontSize: '0.9rem' }}>
                    {profile.notes}
                  </div>
                )}
              </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  )
}