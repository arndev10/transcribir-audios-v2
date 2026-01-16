from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.db.models import JobStatus, JobType


class JobResponse(BaseModel):
    id: int
    user_id: int
    job_type: str
    status: str
    input_data: Optional[str] = None
    result_data: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobStatusResponse(BaseModel):
    id: int
    status: str
    progress: Optional[str] = None
    error: Optional[str] = None
