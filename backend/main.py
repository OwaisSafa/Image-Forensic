from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
import logging
import threading
import time
from datetime import datetime, timedelta
from pathlib import Path

from config.settings import (
    API_TITLE, API_VERSION, API_DESCRIPTION,
    CORS_ORIGINS, CORS_ALLOW_CREDENTIALS, CORS_ALLOW_METHODS, CORS_ALLOW_HEADERS,
    LOG_LEVEL, LOG_FORMAT, UPLOADS_DIR
)
from api.routes import router

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL), format=LOG_FORMAT)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
)

# Custom static file handler for uploads that handles query parameters
@app.get("/uploads/{path:path}")
@app.head("/uploads/{path:path}")
async def serve_upload_file(path: str, request: Request):
    """Serve uploaded files, ignoring query parameters."""
    file_path = UPLOADS_DIR / path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="File not found")

# Include routes
app.include_router(router, prefix="/api/v1")

def cleanup_old_sessions():
    uploads_dir = UPLOADS_DIR
    now = datetime.now()
    cutoff = now - timedelta(hours=1)
    for session_dir in uploads_dir.iterdir():
        if session_dir.is_dir():
            mtime = datetime.fromtimestamp(session_dir.stat().st_mtime)
            if mtime < cutoff:
                for file_path in session_dir.iterdir():
                    if file_path.is_file():
                        file_path.unlink()
                session_dir.rmdir()
                logger.info(f"[CLEANUP] Deleted old session: {session_dir}")

def start_cleanup_thread():
    def run():
        while True:
            cleanup_old_sessions()
            time.sleep(600)  # 10 minutes
    t = threading.Thread(target=run, daemon=True)
    t.start()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting Image Forensics API...")
    start_cleanup_thread()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Image Forensics API...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 