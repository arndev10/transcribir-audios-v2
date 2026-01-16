'use client'

import { useState, useEffect } from 'react'
import { photosApi } from '@/lib/api'

interface PhotoViewerProps {
  photoId: number
  alt: string
}

export default function PhotoViewer({ photoId, alt }: PhotoViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let blobUrl: string | null = null

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(false)
        console.log(`PhotoViewer: Loading photo ${photoId}...`)
        const url = await photosApi.getFileUrl(photoId)
        console.log(`PhotoViewer: Photo ${photoId} loaded successfully`)
        blobUrl = url
        setImageUrl(url)
      } catch (err: any) {
        console.error(`PhotoViewer: Error loading photo ${photoId}:`, err)
        console.error('PhotoViewer: Error details:', {
          message: err?.message,
          stack: err?.stack,
          response: err?.response
        })
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadImage()

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [photoId])

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: 'white'
        }}
      >
        Cargando imagen...
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: 'white'
        }}
      >
        Error al cargar la imagen
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      style={{
        maxWidth: '100%',
        maxHeight: '90vh',
        objectFit: 'contain',
        borderRadius: '8px'
      }}
    />
  )
}
