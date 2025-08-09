#!/bin/bash
set -e

echo "🚀 Image Forensics Tool - Starting Application"
echo "=============================================="

# Check if setup was run
if [ ! -d "backend/venv" ]; then
  echo "❌ Virtual environment not found. Please run './setup.sh' first."
    exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "❌ Node modules not found. Please run './setup.sh' first."
  exit 1
fi

if ! command -v cloudflared &> /dev/null; then
  echo "❌ Cloudflared not found. Please run './setup.sh' first."
  exit 1
fi

# 1. Start backend in background (with uvicorn)
echo "🐍 [1/3] Starting backend server..."
cd backend
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend started (PID $BACKEND_PID)"
sleep 3
cd ..

# 2. Start frontend dev server in background
echo "⚛️  [2/3] Starting frontend dev server..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend dev server started (PID $FRONTEND_PID)"
sleep 5

# 3. Start Cloudflare Tunnel with public access
echo "☁️  [3/3] Starting Cloudflare Tunnel..."

# Detect the actual frontend port from the log
FRONTEND_PORT="5173"
if grep -q "Port 5173 is in use" frontend.log 2>/dev/null; then
  FRONTEND_PORT="5174"
  echo "   Detected frontend running on port $FRONTEND_PORT"
fi

CLOUDFLARE_LOG=cloudflare.log
nohup cloudflared tunnel --url http://localhost:$FRONTEND_PORT > $CLOUDFLARE_LOG 2>&1 &
CLOUDFLARE_PID=$!
echo "   Cloudflare Tunnel started (PID $CLOUDFLARE_PID) pointing to port $FRONTEND_PORT"

# Wait for Cloudflare to print the public URL
echo "⏳ Waiting for Cloudflare Tunnel public URL..."
sleep 5

# Extract the public URL from cloudflare log
CLOUDFLARE_URL=""
for i in {1..10}; do
  CLOUDFLARE_URL=$(grep -m1 -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' $CLOUDFLARE_LOG 2>/dev/null || true)
  if [ -n "$CLOUDFLARE_URL" ]; then
    echo "✅ Cloudflare tunnel URL detected: $CLOUDFLARE_URL"
    break
  fi
  sleep 2
done

echo ""
echo "🎉 Application started successfully!"
echo "=================================="
if [ -n "$CLOUDFLARE_URL" ]; then
  echo "🌐 Public URL: $CLOUDFLARE_URL"
  echo "🔗 Share this URL to access your app from anywhere!"
else
  echo "⚠️  Could not detect Cloudflare public URL."
  echo "   Check cloudflare.log for details."
fi
echo "🏠 Local Frontend: http://localhost:$FRONTEND_PORT"
echo "🔧 Local Backend:  http://localhost:8000"
echo "📚 API Docs:       http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services..."

# Trap to cleanup on exit
trap 'echo ""; echo "🛑 Stopping all services..."; kill $BACKEND_PID $FRONTEND_PID $CLOUDFLARE_PID 2>/dev/null; echo "✅ All services stopped."; exit' INT TERM

# Wait for cloudflared to exit (user can Ctrl+C to stop all)
wait $CLOUDFLARE_PID