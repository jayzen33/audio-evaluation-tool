# 🎵 Audio Evaluation Tools

A web-based toolkit for audio quality evaluation, supporting comparison tagging, AB testing, and MOS scoring.

## Features

- **Comparison** - Tag audio variants as Good/Maybe/Bad with lyrics diff
- **AB Test** - Blind or labeled preference testing
- **MOS Scoring** - Rate audio quality on 1-5 scale
- **Multi-Experiment** - Run multiple experiments via URL paths
- **Persistent Storage** - Auto-saved to localStorage
- **Export Results** - Download JSON with statistics

## Installation

```bash
# Clone and install
git clone <repository-url>
cd audio-evaluation-tools
npm install

# Start dev server
npm run dev
```

Open `http://localhost:30767`

## Usage

### 1. Prepare Data

Create a JSON file with your audio data:

```json
{
  "sample-1": [
    { "melody_GT": { "wav": "/audio/gt.mp3", "lyrics": "Original lyrics" } },
    { "model_a": { "wav": "/audio/a.wav", "lyrics": "Model output" } }
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
- `http://localhost:30767/` - Home page
- `http://localhost:30767/compare/exp1` - Comparison tool
- `http://localhost:30767/abtest/exp1` - AB test
- `http://localhost:30767/mos/exp1` - MOS scoring

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

## License

MIT License - see [LICENSE](LICENSE) file.
