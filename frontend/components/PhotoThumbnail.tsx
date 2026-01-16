'use client'

import { useState, useEffect } from 'react'
import { photosApi } from '@/lib/api'

interface PhotoThumbnailProps {
  photoId: number
  alt: string
  style?: React.CSSProperties
  onClick?: () => void
}

export default function PhotoThumbnail({ photoId, alt, style, onClick }: PhotoThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let blobUrl: string | null = null

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(false)
        console.log(`Loading photo ${photoId}...`)
        const url = await photosApi.getFileUrl(photoId)
        console.log(`Photo ${photoId} loaded successfully, blob URL created`)
        blobUrl = url
        setImageUrl(url)
      } catch (err: any) {
        console.error(`Error loading photo ${photoId}:`, err)
        console.error('Error details:', {
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
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#999'
        }}
      >
        Cargando...
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#999'
        }}
      >
        Imagen no disponible
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      style={style}
      onClick={onClick}
    />
  )
}
