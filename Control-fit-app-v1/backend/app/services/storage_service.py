from pathlib import Path
from typing import Optional
import shutil
from app.config import settings


class StorageService:
    """
    Service for managing file storage.
    
    MVP: Local filesystem storage
    Future: S3, Azure Blob, or similar cloud storage
    """
    
    def __init__(self):
        self.base_path = Path(settings.photos_storage_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def save_file(
        self,
        file_content: bytes,
        filename: str,
        user_id: int,
        subdirectory: Optional[str] = None
    ) -> str:
        """
        Saves a file to storage.
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            user_id: User ID for organization
            subdirectory: Optional subdirectory (e.g., "photos", "documents")
        
        Returns:
            Path where file was saved (relative to base_path)
        """
        user_dir = self.base_path / str(user_id)
        if subdirectory:
            user_dir = user_dir / subdirectory
        
        user_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = user_dir / filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return str(file_path.relative_to(self.base_path))
    
    def get_file_path(
        self,
        relative_path: str
    ) -> Path:
        """
        Gets the full path to a stored file.
        
        Args:
            relative_path: Path relative to base_path
        
        Returns:
            Full Path object
        """
        return self.base_path / relative_path
    
    def delete_file(
        self,
        relative_path: str
    ) -> bool:
        """
        Deletes a file from storage.
        
        Args:
            relative_path: Path relative to base_path
        
        Returns:
            True if deleted, False if not found
        """
        file_path = self.get_file_path(relative_path)
        
        if file_path.exists():
            file_path.unlink()
            return True
        
        return False
    
    def file_exists(
        self,
        relative_path: str
    ) -> bool:
        """
        Checks if a file exists.
        
        Args:
            relative_path: Path relative to base_path
        
        Returns:
            True if exists, False otherwise
        """
        return self.get_file_path(relative_path).exists()


# Singleton instance
storage_service = StorageService()
