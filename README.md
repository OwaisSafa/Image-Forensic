# 🔍 Image Forensics Tool

A powerful, AI-driven image forensics analysis platform that combines state-of-the-art machine learning models to detect image tampering, AI-generated content, perform facial analysis, and enable reverse image search. Built with React frontend and Python FastAPI backend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.100+-green.svg)

## ✨ Features

### 🔍 **Advanced Tamper Detection**
- **TruFor Model**: State-of-the-art image forgery detection
- **Detection Types**: Copy-move, splicing, and other manipulations
- **Output**: Integrity scores with confidence levels and localization maps

### 🤖 **AI Generation Detection**
- **SDXL Detector**: Detects AI-generated images with high accuracy
- **Confidence Scoring**: Provides generation probability scores
- **Model**: Hugging Face Transformers-based detection

### 👥 **Comprehensive Face Analysis**
- **InsightFace Model**: Advanced facial analysis capabilities
- **Features**:
  - Age estimation with confidence scores
  - Gender detection
  - Facial keypoint detection (5-point landmarks)
  - Emotion analysis (happy/sad/neutral)
- **High Accuracy**: Buffalo_L model for reliable results

### 📊 **Metadata & EXIF Analysis**
- **Complete Extraction**: Camera settings, timestamps, GPS data
- **Smart Handling**: Graceful handling of images without EXIF data
- **User Guidance**: Helpful messages for images from social media/screenshots
- **Note**: Many images from social media have EXIF data stripped for privacy

### 🔍 **Reverse Image Search**
- **Multiple Engines**: Google Lens, Bing, Yandex, TinEye
- **Dynamic URLs**: Automatically adapts to any deployment environment
- **Public Access**: Works with Cloudflare Tunnel and cloud providers

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive design
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful icons

### Backend
- **Python 3.10+** with FastAPI
- **PyTorch** for deep learning inference
- **OpenCV** for image processing
- **NumPy** for numerical computations
- **Uvicorn** ASGI server

### AI/ML Models
- **TruFor**: Image forgery detection and localization
- **InsightFace**: Face detection and analysis
- **SDXL Detector**: AI generation detection
- **Custom Emotion Analysis**: Keypoint-based facial expression analysis

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/owaissafa/Image-Forensic.git
cd Image-Forensic
```

2. **Run the setup script**
```bash
chmod +x setup.sh
./setup.sh
```

**Note**: The repository includes AI model files but not the virtual environment to keep the repository size manageable. Large model files are handled by Git LFS for efficient storage. The `setup.sh` script will create the virtual environment when you first run it. Some AI models like SDXL detector are downloaded automatically by their respective libraries on first use.

3. **Start the application**
```bash
chmod +x start.sh
./start.sh
```

The setup script will automatically:
- Install system dependencies
- Set up Python virtual environment
- Install backend requirements
- Install frontend dependencies
- Download and install Cloudflare Tunnel

## 🌐 Deployment Options

### Local Development
- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- Automatic service discovery

### Cloudflare Tunnel (Recommended)
- **Automatic Setup**: Included in the start script
- **Public Access**: Access from anywhere in the world
- **HTTPS**: Secure connections automatically
- **Dynamic URLs**: Automatically detects tunnel URLs

### Manual Setup (Alternative)
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ..
npm install

# Start services
cd backend && source venv/bin/activate && python app.py &
npm run dev &
```

## 📁 Project Structure

```
Image-Forensic/
├── backend/
│   ├── api/                 # FastAPI routes
│   ├── config/              # Configuration management
│   ├── models/              # AI models and weights
│   ├── services/            # Analysis services
│   ├── utils/               # Utility functions
│   └── app.py              # FastAPI application
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript definitions
│   └── App.tsx            # Main application
├── setup.sh               # One-time setup script
├── start.sh               # Application startup script
└── README.md
```

## 🔧 Configuration

### Automatic Configuration
The system requires **zero manual configuration** for most deployments:

- **Local Development**: Works automatically
- **Cloudflare Tunnel**: Detects tunnel URLs from headers
- **Cloud Providers**: Detects environment and gets public IP
- **Platform Deployments**: Reads platform environment variables

### Manual Override (Optional)
If needed, set environment variables:
```bash
# For custom domain
export PUBLIC_BASE_URL=https://yourdomain.com

# For Cloudflare Tunnel
export CLOUDFLARE_TUNNEL_URL=https://your-tunnel.trycloudflare.com
```

### Backend Configuration
The backend automatically detects and uses:
- **GPU acceleration** if available (CUDA)
- **CPU optimization** with multi-threading
- **Model caching** for faster inference
- **Dynamic public URLs** for any deployment

## 🎯 Usage

1. **Upload an Image**: Drag and drop or click to upload any image
2. **Automatic Analysis**: The system will run all analysis types
3. **View Results**: Check each tab for detailed results
4. **Reverse Search**: Use the search engines to find similar images online

### Analysis Types
- **Tamper Detection**: Check for image manipulation
- **AI Detection**: Determine if image is AI-generated
- **Face Analysis**: Get age, gender, and emotion data
- **Metadata**: View EXIF data and camera information
- **Reverse Search**: Find similar images online

## 🔍 Troubleshooting

### Common Issues

**EXIF Data Not Found**
- This is normal for images from social media or screenshots
- Try uploading images directly from cameras for best results
- The system provides helpful guidance messages

**Frontend Not Loading**
- Check if port 5173 is available
- The system automatically detects alternative ports
- Ensure all dependencies are installed

**Cloudflare Tunnel Issues**
- The tunnel is automatically configured in `start.sh`
- Check the `cloudflare.log` for any errors
- Ensure `cloudflared` is properly installed

**Model Download Issues**
- Models are downloaded automatically on first use
- Check internet connection for initial downloads
- Models are cached locally for future use

### System Requirements

**Minimum**
- 4GB RAM
- 2GB free disk space
- Python 3.10+
- Node.js 18+

**Recommended**
- 8GB RAM
- 5GB free disk space
- GPU with CUDA support (optional)

### Model Downloads

The following AI models are included in the repository:

- **TruFor**: ~200MB - Included in repository
- **InsightFace**: ~500MB - Included in repository

The following models are downloaded automatically on first use:

- **SDXL Detector**: ~1.5GB - Downloaded by Hugging Face Transformers

**Note**: First-time setup may take 2-3 minutes depending on your internet connection.

### Git LFS

This repository uses Git Large File Storage (LFS) to handle large AI model files efficiently. When cloning the repository, you may need to install Git LFS:

```bash
# Install Git LFS (if not already installed)
git lfs install

# Clone the repository
git clone https://github.com/owaissafa/Image-Forensic.git
cd Image-Forensic
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤖 AI-Assisted Development

This project was developed with significant assistance from AI tools:

- **Code Generation**: AI helped generate boilerplate code, API endpoints, and React components
- **Debugging**: AI assisted in identifying and fixing complex issues like Cloudflare tunnel configuration
- **Documentation**: AI helped create comprehensive documentation and README files
- **Problem Solving**: AI provided solutions for deployment challenges and system integration
- **Code Optimization**: AI suggested improvements for performance and user experience


## 🙏 Acknowledgments

- [TruFor](https://github.com/grip-unina/TruFor) for image forgery detection
- [InsightFace](https://github.com/deepinsight/insightface) for facial analysis
- [SDXL Detector](https://huggingface.co/Organika/sdxl-detector) for AI generation detection
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the logs in the project directory
3. Open an issue on GitHub with detailed information

---

**Made with ❤️ by [owaissafa](https://github.com/owaissafa)**