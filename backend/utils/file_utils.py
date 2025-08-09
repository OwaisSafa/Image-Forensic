import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional
import logging

from config.settings import UPLOADS_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE

logger = logging.getLogger(__name__)

def validate_file_extension(filename: str) -> bool:
    """Validate if the file extension is allowed."""
    if not filename:
        return False
    
    file_ext = Path(filename).suffix.lower()
    return file_ext in ALLOWED_EXTENSIONS

def validate_file_size(file_size: int) -> bool:
    """Validate if the file size is within limits."""
    return file_size <= MAX_FILE_SIZE

def create_session_id() -> str:
    """Generate a unique session ID."""
    return str(uuid.uuid4())

def save_uploaded_file(file: UploadFile, session_id: str) -> str:
    """Save uploaded file and return the file path."""
    try:
        # Validate file extension
        if not validate_file_extension(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Create session directory
        session_dir = UPLOADS_DIR / session_id
        session_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = session_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        logger.info(f"File saved: {file_path}")
        return str(file_path)
        
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save file")

def cleanup_session(session_id: str) -> None:
    """Clean up session files after analysis."""
    try:
        session_dir = UPLOADS_DIR / session_id
        if session_dir.exists():
            for file_path in session_dir.iterdir():
                if file_path.is_file():
                    file_path.unlink()
            session_dir.rmdir()
            logger.info(f"Cleaned up session: {session_id}")
    except Exception as e:
        logger.warning(f"Error cleaning up session {session_id}: {str(e)}")

def get_file_path(session_id: str, filename: str) -> Optional[Path]:
    """Get the full path of a file in a session."""
    file_path = UPLOADS_DIR / session_id / filename
    return file_path if file_path.exists() else None 