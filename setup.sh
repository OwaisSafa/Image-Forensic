#!/bin/bash
set -e

echo "🚀 Image Forensics Tool - Initial Setup"
echo "========================================"

# 0. Python version check and selection
PYTHON_BIN=""
if command -v python3.10 &> /dev/null; then
  PYTHON_BIN="python3.10"
  echo "✅ Using Python 3.10 for virtual environment."
else
  echo "📦 Python 3.10 not found. Attempting to install..."
  sudo apt update
  sudo apt install -y software-properties-common
  sudo add-apt-repository ppa:deadsnakes/ppa -y
  sudo apt update
  sudo apt install -y python3.10 python3.10-venv python3.10-distutils python3.10-dev
  if command -v python3.10 &> /dev/null; then
    PYTHON_BIN="python3.10"
    echo "✅ Python 3.10 installed successfully."
  else
    echo "❌ Failed to install Python 3.10. Please install it manually."
    exit 1
  fi
fi

# 1. Install system dependencies (Ubuntu/Debian)
echo "📦 [1/4] Installing system dependencies..."
sudo apt update

# Handle Node.js/npm conflicts by removing conflicting packages first
echo "🔧 Resolving Node.js/npm conflicts..."
sudo apt remove -y nodejs npm 2>/dev/null || true
sudo apt autoremove -y

# Install Node.js from NodeSource (more reliable)
echo "📦 Installing Node.js from NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install other dependencies
sudo apt install -y python3 python3-venv python3-pip wget python3.10-dev

# 2. Backend Python venv and dependencies
echo "🐍 [2/4] Setting up Python virtual environment and backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
  $PYTHON_BIN -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip setuptools wheel

# Detect ARM64 and install correct torch/torchvision if needed
ARCH=$(uname -m)
if [[ "$ARCH" == "aarch64" ]]; then
  echo "🔧 ARM64 detected. Installing torch==1.13.1 and torchvision==0.14.1 for compatibility."
  pip install torch==1.13.1 torchvision==0.14.1 --index-url https://download.pytorch.org/whl/cpu
fi
pip install -r requirements.txt

# Create uploads directory
mkdir -p uploads
cd ..

# 3. Frontend dependencies
echo "⚛️  [3/4] Installing frontend dependencies..."
npm install

# 4. Install cloudflared if not present
echo "☁️  [4/4] Installing cloudflared if needed..."
if ! command -v cloudflared &> /dev/null; then
  # Detect architecture for cloudflared
  if [[ "$ARCH" == "aarch64" ]]; then
    CLOUDFLARED_DEB="cloudflared-linux-arm64.deb"
  else
    CLOUDFLARED_DEB="cloudflared-linux-amd64.deb"
  fi
  
  wget "https://github.com/cloudflare/cloudflared/releases/latest/download/$CLOUDFLARED_DEB"
  sudo dpkg -i "$CLOUDFLARED_DEB"
  rm "$CLOUDFLARED_DEB"
  echo "✅ Cloudflared installed successfully."
else
  echo "✅ Cloudflared already installed."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "   Run './start.sh' to start the application."
echo ""
