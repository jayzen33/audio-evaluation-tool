# Audio Evaluation Tools - Backend

A simple Flask backend for user management and cross-device progress tracking.

## Features

- **User Management**: Create and manage users
- **Progress Storage**: Store evaluation progress centrally
- **Cross-Device Sync**: Access your progress from any device
- **Hybrid Mode**: Works with or without backend (falls back to localStorage)

## Quick Start

### Option 1: Using the startup script

```bash
cd backend
chmod +x run.sh
./run.sh
```

### Option 2: Manual setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python3 -c "from app import init_db; init_db()"

# Start server
FLASK_DEBUG=true python3 app.py
```

The server will start at `http://localhost:5000`.

## API Endpoints

### Health Check
```
GET /api/health
```

### Users
```
GET    /api/users              - List all users
GET    /api/users/:id          - Get specific user
POST   /api/users              - Create/update user
```

### Progress
```
GET    /api/progress/:tool/:experiment/:user_id    - Get progress
POST   /api/progress/:tool/:experiment/:user_id    - Save progress
DELETE /api/progress/:tool/:experiment/:user_id    - Delete progress
GET    /api/progress/export/:user_id               - Export all progress
```

Tools: `comparison`, `abtest`, `mos`

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `DATABASE_PATH` | data/evaluation.db | SQLite database path |
| `FLASK_DEBUG` | false | Enable debug mode |

## Frontend Integration

The frontend automatically detects and uses the backend when available. Set the API URL:

```bash
# Development
VITE_API_URL=http://localhost:5000 npm run dev

# Disable backend (localStorage only)
VITE_USE_BACKEND=false npm run dev
```

For GitHub Pages deployment, the frontend will:
1. Try to connect to the backend if `VITE_API_URL` is set
2. Fall back to localStorage if backend is unavailable
3. Work completely offline if `VITE_USE_BACKEND=false`

## Deployment

### Deploy to a server

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set environment variables
4. Run: `python app.py`

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
ENV DATABASE_PATH=/data/evaluation.db

EXPOSE 5000
CMD ["python", "app.py"]
```

### Using systemd

Create `/etc/systemd/system/audio-eval.service`:

```ini
[Unit]
Description=Audio Evaluation Tools Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/audio-evaluation-tools/backend
Environment="DATABASE_PATH=/var/lib/audio-eval/evaluation.db"
ExecStart=/opt/audio-evaluation-tools/backend/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## Database

The backend uses SQLite by default. The database is stored at `data/evaluation.db`.

### Schema

**users table**
- `id` (TEXT PRIMARY KEY) - User ID
- `name` (TEXT) - Display name
- `created_at` (TEXT) - Creation timestamp

**progress table**
- `id` (INTEGER PRIMARY KEY)
- `user_id` (TEXT) - User ID
- `tool` (TEXT) - Tool name (comparison/abtest/mos)
- `experiment` (TEXT) - Experiment name
- `data` (TEXT) - JSON progress data
- `updated_at` (TEXT) - Last update timestamp
