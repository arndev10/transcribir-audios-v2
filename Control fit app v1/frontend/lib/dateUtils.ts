export function getLimaDateString(date?: Date | string): string {
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date
  }
  
  const d = date ? (typeof date === 'string' ? new Date(date) : date) : new Date()
  
  const limaDate = new Date(d.toLocaleString('en-US', { timeZone: 'America/Lima' }))
  
  const year = limaDate.getFullYear()
  const month = String(limaDate.getMonth() + 1).padStart(2, '0')
  const day = String(limaDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export function ensureDateString(date: string): string {
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return getLimaDateString(date)
  }
  return date
}

export function getLimaDate(date?: Date | string): Date {
  const d = date ? (typeof date === 'string' ? new Date(date) : date) : new Date()
  return new Date(d.toLocaleString('en-US', { timeZone: 'America/Lima' }))
}
