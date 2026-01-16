from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import date, datetime
from typing import Optional


class WeeklyFeedbackBase(BaseModel):
    week_start: date
    week_end: date

    @model_validator(mode='after')
    def validate_week_range(self):
        if self.week_start >= self.week_end:
            raise ValueError("week_start must be before week_end")
        return self


class WeeklyFeedbackCreate(WeeklyFeedbackBase):
    pass


class WeeklyFeedbackResponse(WeeklyFeedbackBase):
    id: int
    user_id: int
    avg_weight: Optional[float] = None
    weight_change: Optional[float] = None
    training_days: Optional[int] = None
    avg_sleep: Optional[float] = None
    total_calories: Optional[int] = None
    body_fat_trend: Optional[str] = None
    inflammation_notes: Optional[str] = None
    liquid_retention_notes: Optional[str] = None
    consistency_analysis: Optional[str] = None
    overall_interpretation: Optional[str] = None
    data_hash: Optional[str] = None
    generation_job_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WeeklyFeedbackRequest(BaseModel):
    week_start: date
    week_end: date

    @model_validator(mode='after')
    def validate_week_range(self):
        if self.week_start >= self.week_end:
            raise ValueError("week_start must be before week_end")
        
        # Validate that it's approximately a week (5-9 days to allow flexibility)
        days_diff = (self.week_end - self.week_start).days
        if days_diff < 5 or days_diff > 9:
            raise ValueError("Week range should be approximately 7 days (5-9 days allowed)")
        
        return self
