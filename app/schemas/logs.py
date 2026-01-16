from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class DailyLogBase(BaseModel):
    date: date
    weight: Optional[float] = Field(None, gt=0, description="Weight in kg")
    sleep_hours: Optional[float] = Field(None, ge=0, le=24, description="Sleep hours")
    training_done: bool = False
    calories: Optional[int] = Field(None, ge=0, description="Calories consumed")
    calories_source: Optional[str] = Field(None, pattern="^(manual|estimated)$")
    notes: Optional[str] = None


class DailyLogCreate(DailyLogBase):
    pass


class DailyLogUpdate(BaseModel):
    date: Optional[date] = None
    weight: Optional[float] = Field(None, gt=0)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    training_done: Optional[bool] = None
    calories: Optional[int] = Field(None, ge=0)
    calories_source: Optional[str] = Field(None, pattern="^(manual|estimated)$")
    notes: Optional[str] = None


class DailyLogResponse(DailyLogBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
