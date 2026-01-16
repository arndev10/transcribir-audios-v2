// User types
export interface User {
  id: number
  email: string
}

export interface Token {
  access_token: string
  token_type: string
}

// Profile types
export interface ProfileHistory {
  id: number
  user_id: number
  age?: number
  height?: number
  initial_weight?: number
  training_days_per_week?: number
  training_type?: string
  activity_level?: string
  notes?: string
  created_at: string
}

// Daily Log types
export interface DailyLog {
  id: number
  user_id: number
  date: string
  weight?: number
  sleep_hours?: number
  training_done: boolean
  calories?: number
  calories_source?: string
  notes?: string
  created_at: string
  updated_at?: string
}

// Photo types
export interface Photo {
  id: number
  user_id: number
  date: string
  file_path: string
  file_name: string
  body_fat_min?: number
  body_fat_max?: number
  body_fat_confidence?: string
  is_best_state: boolean
  user_notes?: string
  analysis_job_id?: number
  created_at: string
}

// Cheat Meal types
export interface CheatMeal {
  id: number
  user_id: number
  date: string
  description: string
  estimated_impact?: string
  analysis_job_id?: number
  created_at: string
}

// Feedback types
export interface WeeklyFeedback {
  id: number
  user_id: number
  week_start: string
  week_end: string
  avg_weight?: number
  weight_change?: number
  training_days?: number
  avg_sleep?: number
  total_calories?: number
  body_fat_trend?: string
  inflammation_notes?: string
  liquid_retention_notes?: string
  consistency_analysis?: string
  overall_interpretation?: string
  data_hash?: string
  generation_job_id?: number
  created_at: string
}

// Job types
export interface Job {
  id: number
  user_id: number
  job_type: string
  status: string
  input_data?: string
  result_data?: string
  error_message?: string
  created_at: string
  started_at?: string
  completed_at?: string
}

export interface JobStatus {
  id: number
  status: string
  progress?: string
  error?: string
}
