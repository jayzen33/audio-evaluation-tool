# 🎵 Audio Evaluation Tools

A lightweight web toolkit for audio quality evaluation, supporting subjective comparison, AB testing, and MOS scoring.

[Live Demo](https://jayzen33.github.io/audio-evaluation-tool/)

## Features

- **Comparison Tool**: Tag audio variants (Good/Maybe/Bad) with transcript diffs.
- **AB Testing**: Blind or labeled preference testing.
- **MOS Scoring**: Standard 1-5 Mean Opinion Score rating.
- **Robust Storage**: Sync progress via backend or fallback to local storage.
- **Multi-User**: Individual progress tracking for multiple evaluators.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   # Runs at http://localhost:5173
   ```

## Usage

### 1. Data Preparation
Structure your data in a JSON file (e.g., `data.json`):
```json
{
  "sample-1": [
    { "melody_GT": { "wav": "/audio/ground_truth.mp3", "content": "Transcript..." } },
    { "model_a": { "wav": "/audio/model_output.wav", "content": "Transcript..." } }
  ]
}
```

Import the data:
```bash
npm run copy-audio -- /path/to/data.json -f exp1
```

### 2. Access Tools

| Tool | URL Pattern | Description |
|------|-------------|-------------|
| **Comparison** | `/compare/:exp` | Compare multiple audio samples |
| **AB Test** | `/abtest/:exp` | Choose preference between two samples |
| **MOS** | `/mos/:exp` | Rate quality on 1-5 scale |

*Replace `:exp` with your experiment name (e.g., `exp1` based on the `-f` flag used in import).*

## Backend (Optional)

To enable cross-device sync and multi-user progress tracking, run the Python backend.

```bash
cd backend
pip install -r requirements.txt

# Start backend server
./run.sh   # Linux/macOS
# run.bat  # Windows
```

## License

See [LICENSE](LICENSE) for details.
