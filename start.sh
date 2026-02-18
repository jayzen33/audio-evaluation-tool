#!/bin/bash

# Audio Evaluation Tools - Unified Startup Script
# Starts both frontend and backend servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' not found. Please install it first."
        return 1
    fi
    return 0
}

echo "============================================"
echo "  Audio Evaluation Tools"
echo "============================================"
echo ""

# Check prerequisites
log_info "Checking prerequisites..."
check_command python3 || exit 1
check_command npm || exit 1
check_command node || exit 1
log_info "All prerequisites satisfied"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    log_info "Shutting down servers..."
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo ""
log_info "Starting backend server on http://localhost:5000..."

cd "$BACKEND_DIR" || { log_error "Cannot access backend directory: $BACKEND_DIR"; exit 1; }

mkdir -p data

if [ ! -d "venv" ]; then
    log_info "Creating Python virtual environment..."
    python3 -m venv venv || { log_error "Failed to create virtual environment"; exit 1; }
fi

log_info "Activating virtual environment..."
source venv/bin/activate || { log_error "Failed to activate virtual environment"; exit 1; }

log_info "Installing Python dependencies..."
pip install -q -r requirements.txt || { log_error "Failed to install Python dependencies"; exit 1; }

log_info "Initializing database..."
python3 -c "from app import init_db; init_db()" || { log_error "Failed to initialize database"; exit 1; }

cd "$SCRIPT_DIR" || { log_error "Cannot return to script directory"; exit 1; }

python3 "$BACKEND_DIR/app.py" > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
log_info "Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    log_error "Backend failed to start. Check /tmp/backend.log for details:"
    cat /tmp/backend.log
    exit 1
fi

# Start frontend
echo ""
log_info "Starting frontend on http://localhost:5173..."
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
log_info "Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to start
sleep 3
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    log_error "Frontend failed to start. Check /tmp/frontend.log for details:"
    cat /tmp/frontend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "============================================"
echo -e "  ${GREEN}Servers are running!${NC}"
echo "============================================"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "============================================"

# Wait for either process to exit
wait $FRONTEND_PID $BACKEND_PID
