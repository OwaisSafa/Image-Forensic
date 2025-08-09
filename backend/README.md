# Image Forensics Backend

Advanced image forensic analysis API built with FastAPI, featuring AI detection, tamper analysis, and face recognition.

## 🏗️ Architecture

```
backend/
├── api/                    # API routes and endpoints
│   ├── __init__.py
│   └── routes.py          # FastAPI route definitions
├── config/                 # Configuration settings
│   ├── __init__.py
│   └── settings.py        # Application configuration
├── services/              # Business logic services
│   ├── __init__.py
│   └── analysis_service.py # Forensic analysis service
├── utils/                 # Utility functions
│   ├── __init__.py
│   └── file_utils.py      # File handling utilities
├── models/                # AI models and weights
│   ├── TruFor/           # TruFor tamper detection model
│   └── Image-Forgery-Detection-and-Localization/
├── uploads/               # Temporary file storage
├── venv/                  # Python virtual environment
├── main.py               # FastAPI application entry point
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🚀 Features

### 🔍 Forensic Analysis
- **EXIF Metadata Extraction**: Camera settings, timestamps, GPS data
- **Tamper Detection**: Using TruFor model for image manipulation detection
- **AI Generation Detection**: Hugging Face models for AI-generated content
- **Face Analysis**: InsightFace for face detection, age, gender, keypoints

### 📊 API Endpoints
- `POST /api/v1/analyze`: Analyze uploaded image
- `GET /api/v1/reverse/{engine}`: Reverse image search
- `GET /api/v1/health`: Health check

### 🔧 Technical Features
- FastAPI with automatic OpenAPI documentation
- CORS support for frontend integration
- File upload validation and security
- Session-based file management
- Background task cleanup
- Comprehensive error handling and logging

## 🛠️ Setup

### Prerequisites
- Python 3.8+
- CUDA-compatible GPU (optional, for acceleration)

### Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Download models** (if not already present):
   - TruFor model weights
   - InsightFace models (auto-downloaded on first use)
   - Hugging Face models (auto-downloaded on first use)

### Running the Backend

```bash
# Development mode with auto-reload
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Production mode
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🔍 Analysis Capabilities

### EXIF Metadata
- Camera make and model
- Lens information
- Exposure settings (ISO, aperture, shutter speed)
- GPS coordinates (if available)
- Software used for editing
- Image dimensions and resolution

### Tamper Detection
- **TruFor Model**: State-of-the-art image forgery detection
- Integrity scoring
- Localization maps for tampered regions
- Confidence assessment

### AI Generation Detection
- **SDXL Detector**: Detects AI-generated images
- Confidence scoring
- Binary classification (natural vs AI-generated)
- Model: Organika/sdxl-detector

### Face Analysis
- **InsightFace**: Advanced face detection and analysis
- Face count and bounding boxes
- Age and gender estimation
- Facial keypoints (landmarks)
- Confidence scoring per face

## 🔒 Security Features

- File type validation
- File size limits (50MB max)
- Session-based file isolation
- Automatic cleanup of temporary files
- CORS configuration for frontend security

## 📊 Performance

- **GPU Acceleration**: CUDA support for AI models
- **Async Processing**: Non-blocking API responses
- **Memory Management**: Automatic cleanup of temporary files
- **Caching**: Model loading optimization

## 🐛 Troubleshooting

### Common Issues

1. **Model Loading Errors**:
   - Ensure models are downloaded
   - Check GPU memory availability
   - Verify CUDA installation

2. **Memory Issues**:
   - Reduce batch sizes
   - Use CPU-only mode
   - Monitor system resources

3. **File Upload Errors**:
   - Check file size limits
   - Verify file format support
   - Ensure upload directory permissions

### Logging

The application uses structured logging. Check logs for:
- Model loading status
- Analysis progress
- Error details
- Performance metrics

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include type hints
4. Update documentation
5. Test thoroughly

## 📄 License

This project is part of the Image Forensics application. 