'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import PhotoUpload from '@/components/PhotoUpload'
import PhotoEditForm from '@/components/PhotoEditForm'
import PhotoThumbnail from '@/components/PhotoThumbnail'
import PhotoViewer from '@/components/PhotoViewer'
import { photosApi } from '@/lib/api'
import type { Photo } from '@/types'

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const loadPhotos = async () => {
    try {
      const response = await photosApi.list()
      setPhotos(response.data)
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return

    try {
      await photosApi.delete(id)
      loadPhotos()
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Error al eliminar la foto')
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
          <h1>Fotos Corporales</h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
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
            {showUpload ? 'Cancelar' : '+ Subir Foto'}
          </button>
        </div>

        {showUpload && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <PhotoUpload
              onSuccess={() => {
                setShowUpload(false)
                loadPhotos()
              }}
              onCancel={() => setShowUpload(false)}
            />
          </div>
        )}

        {editingPhoto && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <PhotoEditForm
              photo={editingPhoto}
              onSuccess={() => {
                setEditingPhoto(null)
                loadPhotos()
              }}
              onCancel={() => setEditingPhoto(null)}
            />
          </div>
        )}

        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No hay fotos aún.</p>
            <p>Sube tu primera foto para comenzar a monitorear tu progreso.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <PhotoThumbnail
                    photoId={photo.id}
                    alt={`Foto del ${new Date(photo.date).toLocaleDateString('es-ES')}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      {new Date(photo.date).toLocaleDateString('es-ES')}
                    </div>
                    {photo.body_fat_min && photo.body_fat_max && (
                      <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                        Grasa corporal: {photo.body_fat_min}% - {photo.body_fat_max}%
                        {photo.body_fat_confidence && ` (${photo.body_fat_confidence})`}
                      </div>
                    )}
                    {photo.is_best_state && (
                      <div style={{ marginBottom: '0.5rem', color: 'green', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        ⭐ Mejor estado
                      </div>
                    )}
                    {photo.user_notes && (
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                        {photo.user_notes}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPhoto(photo)
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: '#e3f2fd',
                          border: '1px solid #90caf9',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#1976d2',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(photo.id)
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
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
                  </div>
                </div>
              ))}
          </div>
        )}

        {selectedPhoto && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: 0,
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                ✕ Cerrar
              </button>
              <PhotoViewer photoId={selectedPhoto.id} alt={`Foto del ${new Date(selectedPhoto.date).toLocaleDateString('es-ES')}`} />
              <div
                style={{
                  marginTop: '1rem',
                  color: 'white',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '1rem',
                  borderRadius: '8px',
                  maxWidth: '600px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {new Date(selectedPhoto.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                {selectedPhoto.is_best_state && (
                  <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ⭐ Mejor estado
                  </div>
                )}
                {selectedPhoto.body_fat_min && selectedPhoto.body_fat_max && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    Grasa corporal: {selectedPhoto.body_fat_min}% - {selectedPhoto.body_fat_max}%
                    {selectedPhoto.body_fat_confidence && ` (${selectedPhoto.body_fat_confidence})`}
                  </div>
                )}
                {selectedPhoto.user_notes && (
                  <div style={{ fontStyle: 'italic' }}>{selectedPhoto.user_notes}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </Layout>
    </ProtectedRoute>
  )
}
