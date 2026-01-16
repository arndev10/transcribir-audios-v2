from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileHistoryBase(BaseModel):
    age: Optional[int] = None
    height: Optional[float] = None  # in cm
    initial_weight: Optional[float] = None  # in kg
    training_days_per_week: Optional[int] = None
    training_type: Optional[str] = None
    activity_level: Optional[str] = None
    notes: Optional[str] = None


class ProfileHistoryCreate(ProfileHistoryBase):
    pass


class ProfileHistoryResponse(ProfileHistoryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
