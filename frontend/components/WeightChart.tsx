'use client'

import { useMemo } from 'react'
import type { DailyLog } from '@/types'

interface WeightChartProps {
  logs: DailyLog[]
}

export default function WeightChart({ logs }: WeightChartProps) {
  const weightData = useMemo(() => {
    return logs
      .filter(log => log.weight !== null && log.weight !== undefined)
      .map(log => ({
        date: new Date(log.date),
        weight: log.weight!
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [logs])

  if (weightData.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        <p>No hay datos de peso para mostrar</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Agrega registros con peso para ver la tendencia</p>
      </div>
    )
  }

  const minWeight = Math.min(...weightData.map(d => d.weight))
  const maxWeight = Math.max(...weightData.map(d => d.weight))
  const range = maxWeight - minWeight || 1
  const chartHeight = 200
  const chartWidth = Math.max(600, weightData.length * 40)

  return (
    <div style={{ overflowX: 'auto', padding: '1rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Tendencia de Peso</h3>
      <div style={{ position: 'relative', height: `${chartHeight + 40}px`, minWidth: `${chartWidth}px` }}>
        {/* Y-axis labels */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 40, width: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
          <span>{maxWeight.toFixed(1)} kg</span>
          <span>{((maxWeight + minWeight) / 2).toFixed(1)} kg</span>
          <span>{minWeight.toFixed(1)} kg</span>
        </div>

        {/* Chart area */}
        <div style={{ marginLeft: '60px', position: 'relative', height: `${chartHeight}px`, borderLeft: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
          <svg width={chartWidth - 60} height={chartHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Grid lines */}
            {[0, 0.5, 1].map(y => (
              <line
                key={y}
                x1={0}
                y1={y * chartHeight}
                x2={chartWidth - 60}
                y2={y * chartHeight}
                stroke="#eee"
                strokeWidth={1}
              />
            ))}

            {/* Weight line */}
            <polyline
              points={weightData.map((d, i) => {
                const x = (i / (weightData.length - 1 || 1)) * (chartWidth - 60)
                const y = chartHeight - ((d.weight - minWeight) / range) * chartHeight
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke="#0070f3"
              strokeWidth={2}
            />

            {/* Data points */}
            {weightData.map((d, i) => {
              const x = (i / (weightData.length - 1 || 1)) * (chartWidth - 60)
              const y = chartHeight - ((d.weight - minWeight) / range) * chartHeight
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="#0070f3"
                />
              )
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div style={{ marginLeft: '60px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
          {weightData.length > 0 && (
            <>
              <span>{weightData[0].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              {weightData.length > 1 && (
                <span>{weightData[Math.floor(weightData.length / 2)].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              )}
              {weightData.length > 1 && (
                <span>{weightData[weightData.length - 1].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
        <div>
          <strong>Primer registro:</strong> {weightData[0].weight.toFixed(1)} kg
        </div>
        <div>
          <strong>Último registro:</strong> {weightData[weightData.length - 1].weight.toFixed(1)} kg
        </div>
        <div>
          <strong>Cambio total:</strong>{' '}
          <span style={{ color: weightData[weightData.length - 1].weight - weightData[0].weight < 0 ? 'green' : 'red' }}>
            {weightData[weightData.length - 1].weight - weightData[0].weight > 0 ? '+' : ''}
            {(weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)} kg
          </span>
        </div>
      </div>
    </div>
  )
}
