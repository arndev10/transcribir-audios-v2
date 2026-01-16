'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Control Fit</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Aplicación de monitoreo de grasa corporal y peso
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Monitoreo de Peso</h3>
            <p>Registra tu peso diario y analiza tendencias a largo plazo</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Análisis de Grasa Corporal</h3>
            <p>Sube fotos y obtén estimaciones de grasa corporal</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Feedback Semanal</h3>
            <p>Recibe análisis semanal sobre tu progreso</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link 
            href="/register" 
            style={{ 
              display: 'inline-block',
              padding: '1rem 2rem', 
              backgroundColor: '#0070f3',
              color: 'white',
              borderRadius: '8px',
              marginRight: '1rem'
            }}
          >
            Comenzar
          </Link>
          <Link 
            href="/login"
            style={{ 
              display: 'inline-block',
              padding: '1rem 2rem', 
              border: '1px solid #0070f3',
              color: '#0070f3',
              borderRadius: '8px'
            }}
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </Layout>
  )
}
