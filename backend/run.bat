@echo off
REM Audio Evaluation Tools Backend Startup Script (Windows)

REM Create data directory if not exists
if not exist "data" mkdir data

REM Install dependencies if needed
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
pip install -q -r requirements.txt

REM Initialize database
echo Initializing database...
python -c "from app import init_db; init_db(); print('Database initialized')"

REM Start server
echo Starting backend server on http://localhost:5000
echo API endpoints:
echo   GET  /api/health                    - Health check
echo   GET  /api/users                     - List users
echo   POST /api/users                     - Create user
echo   GET  /api/progress/:tool/:exp/:user - Get progress
echo   POST /api/progress/:tool/:exp/:user - Save progress
echo.

set FLASK_DEBUG=true
python app.py
