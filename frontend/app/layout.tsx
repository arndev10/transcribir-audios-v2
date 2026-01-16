import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Control Fit - Monitoreo de Grasa Corporal y Peso',
  description: 'Aplicación para monitorear y entender tu progreso físico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
