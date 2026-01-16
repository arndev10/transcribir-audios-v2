from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date
from typing import Optional
from app.db.models import ProfileHistory


def get_active_profile(db: Session, user_id: int) -> Optional[ProfileHistory]:
    """
    Returns the most recent (active) profile for a user.
    In this system, the active profile is the one with the latest created_at timestamp.
    """
    return db.query(ProfileHistory).filter(
        ProfileHistory.user_id == user_id
    ).order_by(desc(ProfileHistory.created_at)).first()


def get_profile_at_date(db: Session, user_id: int, target_date: date) -> Optional[ProfileHistory]:
    """
    Returns the profile that was active at a specific date.
    This is the most recent profile created before or on the target date.
    """
    return db.query(ProfileHistory).filter(
        ProfileHistory.user_id == user_id,
        ProfileHistory.created_at <= target_date
    ).order_by(desc(ProfileHistory.created_at)).first()
