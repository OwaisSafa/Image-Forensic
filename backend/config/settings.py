import os
import socket
import requests
from pathlib import Path
from typing import Optional

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Upload settings
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Model paths
MODELS_DIR = BASE_DIR / "models"
TRUFOR_PATH = MODELS_DIR / "tamper_detection" / "TruFor" / "TruFor_train_test"
AI_ANALYSIS_PATH = MODELS_DIR / "ai_analysis" / "sdxl-detector"
FACE_DETECTION_PATH = MODELS_DIR / "face_detection"
EXIF_PATH = MODELS_DIR / "exif"
FILE_INFO_PATH = MODELS_DIR / "file_info"

# API settings
API_TITLE = "Image Forensics API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "Advanced image forensic analysis API with AI detection, tamper analysis, and face recognition"

# CORS settings
CORS_ORIGINS = ["*"]  # In production, replace with specific origins
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]

# Logging
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Analysis settings
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}

# Reverse search engines
VALID_SEARCH_ENGINES = ["google", "bing", "yandex", "tineye"]

def get_public_base_url() -> str:
    """
    Dynamically determine the public base URL for serving images.
    Priority order:
    1. Environment variable PUBLIC_BASE_URL
    2. Cloudflare Tunnel detection
    3. Cloud provider detection
    4. Local development fallback
    """
    # Check if explicitly set via environment variable
    if os.getenv('PUBLIC_BASE_URL'):
        return os.getenv('PUBLIC_BASE_URL')
    
    # Try to detect Cloudflare Tunnel
    try:
        # Get hostname
        hostname = socket.gethostname()
        
        # Check if we're in a Cloudflare Tunnel environment
        if 'trycloudflare.com' in hostname or os.getenv('CLOUDFLARE_TUNNEL'):
            # Try to get the tunnel URL from environment
            tunnel_url = os.getenv('CLOUDFLARE_TUNNEL_URL')
            if tunnel_url:
                return tunnel_url
            
            # If running in tunnel, use localhost as fallback
            # The tunnel will handle the public URL
            return 'http://localhost:8000'
        
        # Check if we're on a cloud provider
        cloud_providers = ['aws', 'azure', 'gcp', 'digitalocean', 'heroku', 'railway', 'render']
        if any(provider in hostname.lower() for provider in cloud_providers):
            # On cloud provider, try to get public IP or domain
            try:
                # Try to get public IP
                response = requests.get('https://api.ipify.org', timeout=5)
                if response.status_code == 200:
                    public_ip = response.text.strip()
                    return f'http://{public_ip}:8000'
            except:
                pass
            
            # If IP detection fails, use localhost (will be handled by reverse proxy)
            return 'http://localhost:8000'
        
        # Check for common environment variables used by cloud providers
        for env_var in ['VERCEL_URL', 'RAILWAY_STATIC_URL', 'RENDER_EXTERNAL_URL', 'HEROKU_APP_NAME']:
            if os.getenv(env_var):
                url = os.getenv(env_var)
                if not url.startswith('http'):
                    url = f'https://{url}'
                return url
        
        # Local development fallback
        return 'http://localhost:8000'
        
    except Exception as e:
        print(f"Warning: Could not determine public URL automatically: {e}")
        return 'http://localhost:8000'

# Dynamic public URL configuration
PUBLIC_BASE_URL = get_public_base_url()

print(f"Using public base URL: {PUBLIC_BASE_URL}")

def get_dynamic_public_url(request_headers: dict = None) -> str:
    """
    Get the public URL dynamically, considering request headers for better detection.
    This is used in API routes to get the most accurate public URL.
    """
    # If explicitly set, use it
    if os.getenv('PUBLIC_BASE_URL'):
        return os.getenv('PUBLIC_BASE_URL')
    
    # If we have request headers, try to extract the actual URL
    if request_headers:
        # Check for Cloudflare Tunnel headers
        cf_connecting_ip = request_headers.get('CF-Connecting-IP')
        x_forwarded_host = request_headers.get('X-Forwarded-Host')
        host = request_headers.get('Host')
        
        if x_forwarded_host:
            protocol = 'https' if request_headers.get('X-Forwarded-Proto') == 'https' else 'http'
            return f"{protocol}://{x_forwarded_host}"
        elif host and 'trycloudflare.com' in host:
            protocol = 'https' if request_headers.get('X-Forwarded-Proto') == 'https' else 'http'
            return f"{protocol}://{host}"
    
    # Fall back to the static detection
    return PUBLIC_BASE_URL 