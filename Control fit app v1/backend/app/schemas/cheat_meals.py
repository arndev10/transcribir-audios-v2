from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class CheatMealBase(BaseModel):
    date: date
    description: str


class CheatMealCreate(CheatMealBase):
    pass


class CheatMealUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None


class CheatMealResponse(CheatMealBase):
    id: int
    user_id: int
    estimated_impact: Optional[str] = None
    analysis_job_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
