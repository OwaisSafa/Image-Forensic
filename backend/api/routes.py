from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any
import logging

from services.analysis_service import analysis_service
from utils.file_utils import create_session_id, save_uploaded_file, cleanup_session, get_file_path
from config.settings import VALID_SEARCH_ENGINES, get_dynamic_public_url

logger = logging.getLogger(__name__)

router = APIRouter()

class AnalysisResult(BaseModel):
    image_id: str
    filename: str
    session_id: str
    results: Dict[str, Any]
    timestamp: str

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_image(
    request: Request,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """Analyze an uploaded image for forensic information."""
    try:
        # Create session ID
        session_id = create_session_id()
        
        # Save image
        image_path = save_uploaded_file(file, session_id)
        
        # Run analysis
        logger.info(f"Starting analysis for session {session_id}")
        results = analysis_service.analyze(image_path)
        
        # Get dynamic public URL for the image
        public_base_url = get_dynamic_public_url(dict(request.headers))
        image_filename = image_path.split('/')[-1]
        public_image_url = f"{public_base_url}/uploads/{session_id}/{image_filename}"
        
        # Create response
        response = AnalysisResult(
            image_id=image_filename,
            filename=file.filename,
            session_id=session_id,
            results=results,
            timestamp=datetime.now().isoformat()
        )
        
        # Do NOT schedule cleanup here; handled by background job
        # if background_tasks:
        #     background_tasks.add_task(cleanup_session, session_id)
        
        return response
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Optional: Manual cleanup endpoint for admin/testing
@router.post("/cleanup/{session_id}")
async def manual_cleanup(session_id: str):
    try:
        cleanup_session(session_id)
        return {"status": "success", "message": f"Session {session_id} cleaned up."}
    except Exception as e:
        logger.error(f"Manual cleanup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Manual cleanup failed: {str(e)}")

@router.get("/reverse/{engine}")
async def reverse_search(
    request: Request,
    engine: str,
    image_id: str,
    session_id: str
):
    """Perform reverse image search using specified engine."""
    try:
        # Validate engine
        if engine not in VALID_SEARCH_ENGINES:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid search engine. Valid engines: {', '.join(VALID_SEARCH_ENGINES)}"
            )
            
        # Get image path
        image_path = get_file_path(session_id, image_id)
        if not image_path:
            raise HTTPException(status_code=404, detail="Image not found")
            
        # Get dynamic public URL for the image
        public_base_url = get_dynamic_public_url(dict(request.headers))
        public_image_url = f"{public_base_url}/uploads/{session_id}/{image_id}"
        
        # Generate search URL based on engine with correct formats
        search_url = ""
        if engine == "google":
            # Google Lens format - using the correct endpoint and parameters
            import urllib.parse
            encoded_url = urllib.parse.quote(public_image_url, safe='')
            search_url = f"https://lens.google/search?ep=ccm&s=4&im={encoded_url}"
        elif engine == "bing":
            # Bing format - using the actual Bing reverse image search format
            import urllib.parse
            encoded_url = urllib.parse.quote(public_image_url, safe='')
            search_url = f"https://www.bing.com/images/search?view=detailv2&iss=SBI&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:{encoded_url}&selectedindex=0&id={encoded_url}&mediaurl={encoded_url}"
        elif engine == "yandex":
            # Yandex format - using their specific parameters
            import urllib.parse
            encoded_url = urllib.parse.quote(public_image_url, safe='')
            search_url = f"https://yandex.com/images/search?rpt=imageview&source=collections&url={encoded_url}"
        elif engine == "tineye":
            # TinEye format - direct URL parameter
            search_url = f"https://www.tineye.com/search?url={public_image_url}"
            
        return {"search_url": search_url}
        
    except Exception as e:
        logger.error(f"Reverse search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Reverse search failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()} 