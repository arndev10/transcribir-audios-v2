export interface WeekInfo {
  weekNumber: number
  weekStart: Date
  weekEnd: Date
}

export function calculateWeekNumber(
  date: Date | string,
  firstLogDate: Date | string | null
): number {
  if (!firstLogDate) return 1

  const targetDate = typeof date === 'string' ? new Date(date) : date
  const startDate = typeof firstLogDate === 'string' ? new Date(firstLogDate) : firstLogDate

  const diffTime = targetDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(diffDays / 7) + 1

  return Math.max(1, weekNumber)
}

export function calculateDayNumber(
  date: Date | string,
  firstLogDate: Date | string | null
): number {
  if (!firstLogDate) {
    return 1
  }

  // Parsear fechas de manera segura para evitar problemas de timezone
  const parseDate = (d: Date | string): Date => {
    if (typeof d === 'string') {
      const dateStr = d.split('T')[0]
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day, 12, 0, 0, 0)
    }
    // Si es un Date, extraer año, mes, día para evitar problemas de timezone
    const year = d.getFullYear()
    const month = d.getMonth()
    const day = d.getDate()
    return new Date(year, month, day, 12, 0, 0, 0)
  }

  const target = parseDate(date)
  const start = parseDate(firstLogDate)

  // Normalizar a medianoche para cálculo
  target.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)

  // Calcular diferencia en días desde la primera fecha
  const diffTime = target.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // Si es la misma fecha (diffDays = 0), es día 1
  if (diffDays === 0) {
    return 1
  }

  // Calcular la semana a la que pertenece esta fecha
  const weekNumber = Math.floor(diffDays / 7) + 1

  // Calcular el inicio de la semana actual (día 1 de esa semana)
  // El inicio de semana 1 es la primera fecha, semana 2 es +7 días, etc.
  const weekStart = new Date(start)
  weekStart.setDate(start.getDate() + (weekNumber - 1) * 7)
  weekStart.setHours(0, 0, 0, 0)

  // Calcular el día dentro de la semana (1-7)
  // Diferencia en días desde el inicio de la semana
  const dayInWeek = Math.floor((target.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Asegurar que esté entre 1 y 7
  return Math.max(1, Math.min(7, dayInWeek))
}

export function getWeekInfo(
  date: Date | string,
  firstLogDate: Date | string | null
): WeekInfo {
  if (!firstLogDate) {
    const d = typeof date === 'string' ? new Date(date) : date
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay() + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return {
      weekNumber: 1,
      weekStart,
      weekEnd
    }
  }

  const targetDate = typeof date === 'string' ? new Date(date) : date
  const startDate = typeof firstLogDate === 'string' ? new Date(firstLogDate) : firstLogDate

  const diffTime = targetDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(diffDays / 7) + 1

  const weekStart = new Date(startDate)
  weekStart.setDate(startDate.getDate() + (weekNumber - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return {
    weekNumber: Math.max(1, weekNumber),
    weekStart,
    weekEnd
  }
}

export function groupByWeek<T extends { date: string }>(
  items: T[],
  firstLogDate: Date | string | null
): Map<number, T[]> {
  const grouped = new Map<number, T[]>()

  items.forEach((item) => {
    const weekNumber = calculateWeekNumber(item.date, firstLogDate)
    if (!grouped.has(weekNumber)) {
      grouped.set(weekNumber, [])
    }
    grouped.get(weekNumber)!.push(item)
  })

  return grouped
}

export function getFirstLogDate(logs: { date: string }[]): Date | null {
  if (logs.length === 0) return null

  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = a.date.split('T')[0].split('-').map(Number)
    const dateB = b.date.split('T')[0].split('-').map(Number)
    const timeA = new Date(dateA[0], dateA[1] - 1, dateA[2]).getTime()
    const timeB = new Date(dateB[0], dateB[1] - 1, dateB[2]).getTime()
    return timeA - timeB
  })

  const firstDateStr = sortedLogs[0].date.split('T')[0]
  const [year, month, day] = firstDateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}
