# Image Forensics Models

Advanced image forensic analysis models organized by analysis type.

## 🏗️ Architecture

```
models/
├── README.md                    # This file
├── download_models.py           # Model download script
├── exif/                       # EXIF metadata analysis
│   ├── config/
│   │   └── model_config.yaml   # EXIF configuration
│   ├── docs/
│   │   └── README.md           # EXIF documentation
│   ├── models/                 # No models (uses exifread library)
│   └── scripts/
│       └── test_exif.py        # EXIF test script
├── ai_analysis/                # AI generation detection
│   ├── config/
│   │   └── model_config.yaml   # AI analysis configuration
│   ├── docs/
│   │   └── README.md           # AI analysis documentation
│   ├── models/
│   │   └── sdxl-detector/      # SDXL detector model files
│   └── scripts/
│       └── test_ai_detection.py # AI detection test script
├── face_detection/             # Face analysis and demographics
│   ├── config/
│   │   └── model_config.yaml   # Face detection configuration
│   ├── docs/
│   │   └── README.md           # Face detection documentation
│   ├── models/                 # Auto-downloaded to cache
│   └── scripts/                # Test scripts
├── file_info/                  # File metadata analysis
│   ├── config/
│   │   └── model_config.yaml   # File info configuration
│   ├── docs/
│   │   └── README.md           # File info documentation
│   ├── models/                 # No models (uses PIL)
│   └── scripts/                # Test scripts
└── tamper_detection/           # Image forgery detection
    ├── config/
    │   └── model_config.yaml   # Tamper detection configuration
    ├── docs/
    │   └── README.md           # Tamper detection documentation
    ├── models/
    │   └── TruFor/             # TruFor model files
    └── scripts/                # Test scripts
```

## 📊 Model Categories

### 📸 EXIF Analysis (`exif/`)
- **Purpose**: Extract metadata from images
- **Models**: None (uses `exifread` library)
- **Features**: Camera info, timestamps, GPS data
- **Size**: ~8KB (documentation only)

### 🔍 Tamper Detection (`tamper_detection/`)
- **Purpose**: Detect image manipulation and forgery
- **Models**: TruFor (268MB)
- **Features**: Integrity scoring, localization maps
- **Size**: ~366MB

### 🤖 AI Analysis (`ai_analysis/`)
- **Purpose**: Detect AI-generated images
- **Models**: SDXL Detector (332MB)
- **Features**: Binary classification, confidence scoring
- **Size**: ~332MB

### 👥 Face Detection (`face_detection/`)
- **Purpose**: Face analysis and demographics
- **Models**: InsightFace (auto-downloaded)
- **Features**: Face detection, age, gender, keypoints
- **Size**: ~8KB + cache

### 📁 File Info (`file_info/`)
- **Purpose**: Extract file metadata
- **Models**: None (uses PIL and file operations)
- **Features**: File size, dimensions, format info
- **Size**: ~8KB (documentation only)

## 🚀 Quick Start

### 1. Download Models
```bash
cd backend/models
python download_models.py
```

### 2. Test Individual Models
```bash
# Test EXIF analysis
python exif/scripts/test_exif.py path/to/image.jpg

# Test AI detection
python ai_analysis/scripts/test_ai_detection.py path/to/image.jpg

# Test face detection
python face_detection/scripts/test_face_detection.py path/to/image.jpg
```

### 3. Use in Application
```python
from services.analysis_service import AnalysisService

service = AnalysisService()
results = service.analyze("image.jpg")
```

## ⚙️ Configuration

Each model type has its own configuration file:
- `*/config/model_config.yaml` - Model-specific settings
- `*/docs/README.md` - Detailed documentation
- `*/scripts/` - Test and utility scripts

## 📈 Performance

| Model Type | Size | Speed | GPU Support |
|------------|------|-------|-------------|
| EXIF | 8KB | Fast | No |
| Tamper Detection | 366MB | Medium | Yes |
| AI Analysis | 332MB | Medium | Yes |
| Face Detection | 8KB + cache | Fast | Yes |
| File Info | 8KB | Fast | No |

## 🔧 Maintenance

### Model Updates
```bash
# Update all models
python download_models.py

# Update specific model
cd ai_analysis && python scripts/update_model.py
```

### Cache Management
```bash
# Clear Hugging Face cache
rm -rf ~/.cache/huggingface/

# Clear InsightFace cache
rm -rf ~/.cache/insightface/
```

### Disk Usage
```bash
# Check model sizes
du -sh */

# Check cache sizes
du -sh ~/.cache/huggingface/ ~/.cache/insightface/
```

## 🐛 Troubleshooting

### Common Issues

1. **Model Download Failures**
   - Check internet connection
   - Verify disk space
   - Check permissions

2. **GPU Memory Issues**
   - Reduce batch size in config
   - Use CPU-only mode
   - Monitor GPU memory

3. **Cache Issues**
   - Clear model caches
   - Re-download models
   - Check cache permissions

### Logs
- Application logs: `backend/logs/`
- Model logs: Check individual model folders
- Cache logs: `~/.cache/`

## 📚 Documentation

- **Main API**: `backend/README.md`
- **Model Configs**: `*/config/model_config.yaml`
- **Model Docs**: `*/docs/README.md`
- **Test Scripts**: `*/scripts/`

## 🤝 Contributing

1. Follow the folder structure
2. Add configuration files
3. Include test scripts
4. Update documentation
5. Test thoroughly

## 📄 License

This project is part of the Image Forensics application.
