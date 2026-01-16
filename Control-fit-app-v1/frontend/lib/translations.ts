export const translateTrainingType = (type: string | null | undefined): string => {
  if (!type) return 'No especificado'
  
  const translations: Record<string, string> = {
    strength: 'Fuerza',
    cardio: 'Cardio',
    mixed: 'Mixto',
    other: 'Otro'
  }
  
  return translations[type] || type
}

export const translateActivityLevel = (level: string | null | undefined): string => {
  if (!level) return 'No especificado'
  
  const translations: Record<string, string> = {
    sedentary: 'Sedentario',
    moderate: 'Moderado',
    active: 'Activo',
    very_active: 'Muy Activo'
  }
  
  return translations[level] || level
}
