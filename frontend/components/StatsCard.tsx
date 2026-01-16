'use client'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
}

export default function StatsCard({ title, value, subtitle, trend, icon }: StatsCardProps) {
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#666'
  
  return (
    <div style={{
      padding: '1.5rem',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>{title}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>{value}</div>
          {subtitle && (
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>{subtitle}</div>
          )}
        </div>
        {icon && (
          <div style={{ fontSize: '2rem' }}>{icon}</div>
        )}
      </div>
      {trend && (
        <div style={{ fontSize: '0.75rem', color: trendColor, marginTop: '0.5rem' }}>
          {trend === 'up' && '↑ Aumentando'}
          {trend === 'down' && '↓ Disminuyendo'}
          {trend === 'neutral' && '→ Estable'}
        </div>
      )}
    </div>
  )
}
