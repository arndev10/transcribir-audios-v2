import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Helper function to extract error message from FastAPI error response
export const getErrorMessage = (error: any): string => {
  if (!error) return 'Error desconocido'
  
  // Si hay una respuesta del servidor
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail
    
    // Si detail es un string, usarlo directamente
    if (typeof detail === 'string') {
      return detail
    }
    // Si detail es un array (errores de validación de Pydantic)
    else if (Array.isArray(detail)) {
      return detail.map((e: any) => {
        const field = e.loc?.slice(1).join('.') || 'campo' // slice(1) para omitir 'body'
        return `${field}: ${e.msg}`
      }).join(', ')
    }
    // Si detail es un objeto con mensaje
    else if (typeof detail === 'object' && detail.msg) {
      return detail.msg
    }
  }
  
  // Si hay un mensaje de error en el error
  if (error.message) {
    return error.message
  }
  
  return 'Error desconocido'
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('access_token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('Token agregado a la petición:', config.url, token.substring(0, 20) + '...')
  } else {
    console.warn('No hay token en localStorage para la petición:', config.url)
  }
  // Para FormData, no establecer Content-Type manualmente
  // El navegador lo establecerá automáticamente con el boundary correcto
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
    console.log('FormData detectado, Content-Type eliminado. Headers:', config.headers)
  }
  return config
})

// Auth
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  
  login: (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  
  getMe: () => api.get('/auth/me'),
}

// Profile
export const profileApi = {
  create: (data: any) => api.post('/profile', data),
  getActive: () => api.get('/profile/active'),
  list: () => api.get('/profile'),
  get: (id: number) => api.get(`/profile/${id}`),
}

// Daily Logs
export const dailyLogsApi = {
  create: (data: any) => api.post('/daily-logs', data),
  list: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/daily-logs', { params }),
  get: (id: number) => api.get(`/daily-logs/${id}`),
  update: (id: number, data: any) => api.put(`/daily-logs/${id}`, data),
  delete: (id: number) => api.delete(`/daily-logs/${id}`),
}

// Photos
export const photosApi = {
  upload: (file: File, date: string, isBestState?: boolean, notes?: string) => {
    const formData = new FormData()
    // IMPORTANTE: El orden puede importar - file primero, luego los otros campos
    formData.append('file', file)
    formData.append('date', date) // Cambiado de vuelta a 'date' para coincidir con el backend
    if (isBestState !== undefined) {
      formData.append('is_best_state', String(isBestState))
    }
    if (notes) {
      formData.append('user_notes', notes)
    }
    // Debug: verificar qué se está enviando
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value)
    }
    console.log('Fecha a enviar:', date)
    // No especificar Content-Type manualmente - el navegador lo establecerá con el boundary correcto
    return api.post('/photos', formData)
  },
  list: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/photos', { params }),
  get: (id: number) => api.get(`/photos/${id}`),
  getFileUrl: async (id: number): Promise<string> => {
    const token = localStorage.getItem('access_token')
    const url = `${API_URL}/api/photos/${id}/file`
    
    if (!token) {
      throw new Error('No authentication token')
    }
    
    try {
      console.log(`Fetching photo ${id} from: ${url}`)
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log(`Response status for photo ${id}:`, response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to load image ${id}. Status: ${response.status}, Error: ${errorText}`)
        throw new Error(`Failed to load image: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const blob = await response.blob()
      console.log(`Photo ${id} blob created, size: ${blob.size} bytes, type: ${blob.type}`)
      const blobUrl = URL.createObjectURL(blob)
      console.log(`Photo ${id} blob URL created: ${blobUrl.substring(0, 50)}...`)
      return blobUrl
    } catch (error: any) {
      console.error(`Error loading photo ${id}:`, error)
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      throw error
    }
  },
  update: (id: number, data: any) => api.put(`/photos/${id}`, data),
  delete: (id: number) => api.delete(`/photos/${id}`),
}

// Cheat Meals
export const cheatMealsApi = {
  create: (data: any) => api.post('/cheat-meals', data),
  list: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/cheat-meals', { params }),
  get: (id: number) => api.get(`/cheat-meals/${id}`),
  update: (id: number, data: any) => api.put(`/cheat-meals/${id}`, data),
  delete: (id: number) => api.delete(`/cheat-meals/${id}`),
}

// Feedback
export const feedbackApi = {
  requestWeekly: (weekStart: string, weekEnd: string) =>
    api.post('/feedback/weekly', { week_start: weekStart, week_end: weekEnd }),
  list: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/feedback/weekly', { params }),
  get: (id: number) => api.get(`/feedback/weekly/${id}`),
}

// Jobs
export const jobsApi = {
  list: (status?: string) => api.get('/jobs', { params: { status_filter: status } }),
  get: (id: number) => api.get(`/jobs/${id}`),
  getStatus: (id: number) => api.get(`/jobs/${id}/status`),
  process: (id: number) => api.post(`/jobs/${id}/process`),
}

export default api
