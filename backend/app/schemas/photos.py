from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import date, datetime
from typing import Optional


class PhotoBase(BaseModel):
    date: date
    file_name: str
    is_best_state: bool = False
    user_notes: Optional[str] = None


class PhotoCreate(PhotoBase):
    pass


class PhotoUpdate(BaseModel):
    date: Optional[date] = None
    is_best_state: Optional[bool] = None
    user_notes: Optional[str] = None
    body_fat_min: Optional[float] = Field(None, ge=0, le=100)
    body_fat_max: Optional[float] = Field(None, ge=0, le=100)
    body_fat_confidence: Optional[str] = None

    @model_validator(mode='after')
    def validate_body_fat_range(self):
        if self.body_fat_min is not None and self.body_fat_max is not None:
            if self.body_fat_min >= self.body_fat_max:
                raise ValueError("body_fat_min must be less than body_fat_max")
        return self


class BodyFatEstimation(BaseModel):
    body_fat_min: float = Field(ge=0, le=100)
    body_fat_max: float = Field(ge=0, le=100)
    body_fat_confidence: Optional[str] = None

    @model_validator(mode='after')
    def validate_range(self):
        if self.body_fat_min >= self.body_fat_max:
            raise ValueError("body_fat_min must be less than body_fat_max")
        return self


class PhotoResponse(PhotoBase):
    id: int
    user_id: int
    file_path: str
    body_fat_min: Optional[float] = None
    body_fat_max: Optional[float] = None
    body_fat_confidence: Optional[str] = None
    analysis_job_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
