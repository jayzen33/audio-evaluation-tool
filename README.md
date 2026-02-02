# 🎵 Audio Evaluation Tools

A web-based toolkit for audio quality evaluation, supporting comparison tagging, AB testing, and MOS scoring.

## Features

- **Comparison** - Tag audio variants as Good/Maybe/Bad with content diff
- **AB Test** - Blind or labeled preference testing
- **MOS Scoring** - Rate audio quality on 1-5 scale
- **Multi-Experiment** - Run multiple experiments via URL paths
- **Persistent Storage** - Auto-saved progress with hybrid storage (backend + localStorage)
- **User Management** - Multi-user support with individual progress tracking
- **Cross-Device Sync** - Backend integration for seamless progress synchronization
- **Robust Data Protection** - Triple-layer save protection prevents data loss
- **Export Results** - Download JSON with statistics

## Demo

Try the live demo: https://jayzen33.github.io/audio-evaluation-tool/

> Note: The demo is for preview purposes only. For actual use, please deploy locally or on your own server.

## Installation

```bash
# Clone and install
git clone <repository-url>
cd audio-evaluation-tools
npm install

# Start dev server (default: http://localhost:5173)
npm run dev
```

## Custom Port

Set the `VITE_PORT` environment variable to use a custom port:

```bash
# Linux/macOS
VITE_PORT=8080 npm run dev

# Windows
set VITE_PORT=8080 && npm run dev
```

## Usage

### 1. Prepare Data

Create a JSON file with your audio data:

```json
{
  "sample-1": [
    { "melody_GT": { "wav": "/audio/gt.mp3", "content": "Ground truth transcript" } },
    { "model_a": { "wav": "/audio/a.wav", "content": "Model output transcript" } }
  ]
}
```

### 2. Load Data

Use the helper script to copy audio files:

```bash
npm run copy-audio -- /path/to/data.json -f exp1
```

### 3. Access Tools

| Tool | URL | Description |
|------|-----|-------------|
| Comparison | `/compare/:exp` | Tag variants (good/maybe/bad) |
| AB Test | `/abtest/:exp` | Select preferred option |
| MOS | `/mos/:exp` | Rate quality 1-5 |

Examples:
- `http://localhost:5173/` - Home page
- `http://localhost:5173/compare/exp1` - Comparison tool
- `http://localhost:5173/abtest/exp1` - AB test
- `http://localhost:5173/mos/exp1` - MOS scoring

## Backend (Optional)

For cross-device progress synchronization and multi-user support, run the Python backend:

```bash
cd backend
./run.sh  # or run.bat on Windows
```

The backend provides:
- **Centralized user management** - Track multiple scorers
- **Cross-device progress synchronization** - Continue work from any device
- **SQLite database** - Reliable data persistence
- **Robust data protection** - Prevents data loss during rapid operations
- **Progress history** - Track when users last updated their work

See [backend/README.md](backend/README.md) for details.

### Backend Setup

1. **Install dependencies:**
   ```bash
| `VITE_PORT` | Frontend dev server port | `5173` |

## Architecture

### Data Flow

```
User Action → React State → Save Effect → Hybrid Storage
                                           ├─ Backend API (primary)
                                           └─ localStorage (fallback)
```

### Save Protection

Progress saving uses a three-layer protection system to prevent data loss:

1. **Initialization Guard** - Prevents save during component mount
2. **Context Isolation** - Uses refs to avoid saves on user/experiment changes
3. **Load Completion Guard** - Waits for data load before allowing saves

This ensures your work is never lost, even during:
- Page refreshes (including rapid refreshes)
- User login/logout
- Experiment switching
- Network interruptions (localStorage fallback)

## Troubleshooting

### Progress Not Saving

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check browser console** (F12) for errors

3. **Verify you're logged in** (username should show in top-right)

4. **Test with localStorage:**
   Temporarily disable backend:
   ```bash
   VITE_USE_BACKEND=false npm run dev
   ```

### Data Verification

Check what's in the database:
```bash
sqlite3 backend/data/evaluation.db \
  "SELECT tool, user_id, substr(data,1,50) FROM progress;"
```

Should show actual data, not empty objects `{}`.

## Recent Updates

- ✅ Fixed backend progress tracking issues
- ✅ Added protection against rapid refresh data loss
- ✅ Improved user/experiment context handling
- ✅ Added comprehensive test suite
- ✅ Enhanced error handling and logging
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   ./run.sh  # Linux/macOS
   # or
   run.bat   # Windows
   ```

3. **Verify it's running:**
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

4. **Update frontend configuration** (optional):
   Create a `.env` file in the project root:
   ```bash
   VITE_API_URL=http://localhost:5000
   VITE_USE_BACKEND=true
   ```

### Testing Backend Functionality

Run the provided test scripts to verify everything works:

```bash
cd backend

# Test basic functionality
./test-backend.sh

# Test data persistence
./test-rapid-refresh.sh
```

All tests should pass with ✅ indicators.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_USE_BACKEND` | Enable/disable backend | `true` |

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

## License

See [LICENSE](LICENSE) file for details.
