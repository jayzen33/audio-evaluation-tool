#!/bin/bash

# Audio Evaluation Tools - Unified Startup Script
# Starts both frontend and backend servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "============================================"
echo "  Audio Evaluation Tools"
echo "============================================"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend server on http://localhost:5000..."
cd "$BACKEND_DIR"
mkdir -p data

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
python3 -c "from app import init_db; init_db()"

cd "$SCRIPT_DIR"
python3 "$BACKEND_DIR/app.py" &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend
echo "Starting frontend on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "============================================"
echo "  Servers are running!"
echo "============================================"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "============================================"

# Wait for either process to exit
wait $FRONTEND_PID $BACKEND_PID
