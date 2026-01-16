from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Boolean, ForeignKey, Text, Enum as SQLEnum, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.db.base import Base


class JobStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    done = "done"
    failed = "failed"
    outdated = "outdated"


class JobType(str, enum.Enum):
    photo_analysis = "photo_analysis"
    cheat_meal_analysis = "cheat_meal_analysis"
    weekly_feedback = "weekly_feedback"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profiles = relationship("ProfileHistory", back_populates="user")
    daily_logs = relationship("DailyLog", back_populates="user")
    photos = relationship("Photo", back_populates="user")
    cheat_meals = relationship("CheatMeal", back_populates="user")
    weekly_feedbacks = relationship("WeeklyFeedback", back_populates="user")
    jobs = relationship("Job", back_populates="user")


class ProfileHistory(Base):
    __tablename__ = "profile_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Basic info
    age = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)  # in cm
    initial_weight = Column(Float, nullable=True)  # in kg
    
    # Training context
    training_days_per_week = Column(Integer, nullable=True)
    training_type = Column(String, nullable=True)  # e.g., "strength", "cardio", "mixed"
    activity_level = Column(String, nullable=True)  # e.g., "sedentary", "moderate", "active"
    
    # Notes
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes - most recent profile is the active one
    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
    )
    
    # Relationships
    user = relationship("User", back_populates="profiles")


class DailyLog(Base):
    __tablename__ = "daily_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    date = Column(Date, nullable=False, index=True)
    
    # Metrics
    weight = Column(Float)  # in kg
    sleep_hours = Column(Float)  # optional
    training_done = Column(Boolean, default=False)
    calories = Column(Integer)  # manual or estimated
    calories_source = Column(String)  # "manual" or "estimated", defaults to "manual" if calories present
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_daily_log_user_date'),
        Index('idx_daily_log_user_date', 'user_id', 'date'),
    )
    
    # Relationships
    user = relationship("User", back_populates="daily_logs")


class CheatMeal(Base):
    __tablename__ = "cheat_meals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    date = Column(Date, nullable=False, index=True)
    
    # Qualitative input
    description = Column(Text, nullable=False)  # user's description
    estimated_impact = Column(Text, nullable=True)  # AI-generated interpretation (nullable until processed)
    
    # Job tracking
    analysis_job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_cheat_meal_user_date', 'user_id', 'date'),
    )
    
    # Relationships
    user = relationship("User", back_populates="cheat_meals")
    analysis_job = relationship("Job", foreign_keys=[analysis_job_id])


class Photo(Base):
    __tablename__ = "photos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    date = Column(Date, nullable=False, index=True)
    
    # Storage
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    
    # Body fat estimation (range) - nullable until analysis is done
    body_fat_min = Column(Float, nullable=True)  # percentage
    body_fat_max = Column(Float, nullable=True)  # percentage
    body_fat_confidence = Column(String, nullable=True)  # e.g., "low", "medium", "high"
    
    # User confirmation
    is_best_state = Column(Boolean, default=False)
    user_notes = Column(Text)
    
    # Job tracking
    analysis_job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_photo_user_date', 'user_id', 'date'),
    )
    
    # Relationships
    user = relationship("User", back_populates="photos")
    analysis_job = relationship("Job", foreign_keys=[analysis_job_id])


class WeeklyFeedback(Base):
    __tablename__ = "weekly_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Week identification
    week_start = Column(Date, nullable=False, index=True)
    week_end = Column(Date, nullable=False)
    
    # Deterministic metrics (calculated before AI)
    avg_weight = Column(Float)
    weight_change = Column(Float)
    training_days = Column(Integer)
    avg_sleep = Column(Float)
    total_calories = Column(Integer)
    
    # AI-generated content
    body_fat_trend = Column(Text, nullable=True)
    inflammation_notes = Column(Text, nullable=True)
    liquid_retention_notes = Column(Text, nullable=True)
    consistency_analysis = Column(Text, nullable=True)
    overall_interpretation = Column(Text, nullable=True)
    
    # Data versioning for invalidation
    # Hash of relevant data IDs used to generate this feedback
    # When underlying data changes, we can detect and mark as outdated
    data_hash = Column(String, nullable=True)  # Simple hash of log_ids, photo_ids, cheat_meal_ids used
    
    # Job tracking
    generation_job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'week_start', name='uq_feedback_user_week'),
        Index('idx_feedback_user_week', 'user_id', 'week_start'),
    )
    
    # Relationships
    user = relationship("User", back_populates="weekly_feedbacks")
    generation_job = relationship("Job", foreign_keys=[generation_job_id])


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    job_type = Column(SQLEnum(JobType), nullable=False)
    status = Column(SQLEnum(JobStatus), default=JobStatus.pending, nullable=False)
    
    # Input data (JSON stored as text for simplicity)
    input_data = Column(Text, nullable=True)
    
    # Results (JSON stored as text)
    result_data = Column(Text, nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_user_status', 'user_id', 'status'),
        Index('idx_job_type_status', 'job_type', 'status'),
    )
    
    # Relationships
    user = relationship("User", back_populates="jobs")
