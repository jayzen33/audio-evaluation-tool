#!/bin/bash

# Audio Evaluation Tools Backend Startup Script

# Create data directory if not exists
mkdir -p data

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -q -r requirements.txt

# Initialize database
echo "Initializing database..."
python3 -c "from app import init_db; init_db(); print('Database initialized')"

# Start server
echo "Starting backend server on http://localhost:5000"
echo "API endpoints:"
echo "  GET  /api/health                    - Health check"
echo "  GET  /api/users                     - List users"
echo "  POST /api/users                     - Create user"
echo "  GET  /api/progress/:tool/:exp/:user - Get progress"
echo "  POST /api/progress/:tool/:exp/:user - Save progress"
echo ""

FLASK_DEBUG=true python3 app.py
