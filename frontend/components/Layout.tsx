'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isAuthenticated, removeToken } from '@/lib/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    
    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = () => {
      setAuthenticated(isAuthenticated())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    removeToken()
    setAuthenticated(false)
    window.location.href = '/'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '1rem 2rem', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5'
      }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Control Fit
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {authenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname === '/dashboard' ? '#0070f3' : 'inherit',
                    fontWeight: pathname === '/dashboard' ? 'bold' : 'normal',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: pathname === '/dashboard' ? '#e3f2fd' : 'transparent'
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/logs" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname === '/logs' ? '#0070f3' : 'inherit',
                    fontWeight: pathname === '/logs' ? 'bold' : 'normal',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: pathname === '/logs' ? '#e3f2fd' : 'transparent'
                  }}
                >
                  Logs
                </Link>
                <Link 
                  href="/photos" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname === '/photos' ? '#0070f3' : 'inherit',
                    fontWeight: pathname === '/photos' ? 'bold' : 'normal',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: pathname === '/photos' ? '#e3f2fd' : 'transparent'
                  }}
                >
                  Fotos
                </Link>
                <Link 
                  href="/cheat-meals" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname === '/cheat-meals' ? '#0070f3' : 'inherit',
                    fontWeight: pathname === '/cheat-meals' ? 'bold' : 'normal',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: pathname === '/cheat-meals' ? '#e3f2fd' : 'transparent'
                  }}
                >
                  Comidas Trampa
                </Link>
                <Link 
                  href="/feedback" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname === '/feedback' ? '#0070f3' : 'inherit',
                    fontWeight: pathname === '/feedback' ? 'bold' : 'normal',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: pathname === '/feedback' ? '#e3f2fd' : 'transparent'
                  }}
                >
                  Feedback
                </Link>
                <Link 
                  href="/profile" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname === '/profile' ? '#0070f3' : 'inherit',
                    fontWeight: pathname === '/profile' ? 'bold' : 'normal',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: pathname === '/profile' ? '#e3f2fd' : 'transparent'
                  }}
                >
                  Perfil
                </Link>
                <button 
                  onClick={handleLogout}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>Iniciar Sesión</Link>
                <Link href="/register" style={{ textDecoration: 'none', color: 'inherit' }}>Registrarse</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
      <footer style={{ 
        padding: '1rem 2rem', 
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>Control Fit - Monitoreo de grasa corporal y peso</p>
      </footer>
    </div>
  )
}
