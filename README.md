# Audio Comparison Tool

A React-based web application for comparing audio model outputs side-by-side.

## Features

- Compare multiple audio variants (Ground Truth, rebuilds, etc.)
- Tag audio quality (Good, Maybe, Bad) with persistence
- Side-by-side lyrics comparison with diff highlighting
- Support for multiple experiments via URL paths
- Export tags as JSON

## Prerequisites

- Node: 20.19+ or 22.12+
- Recommended: install via nvm

```bash
# Install nvm (skip if already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. ~/.nvm/nvm.sh

# Install and use Node 22
nvm install 22
nvm use 22
```

## Quick Start

```bash
npm install

# Copy your audio data (see Data Preparation below)
npm run copy-audio -- /path/to/your/data.json -f my-experiment

npm run dev
```

Open browser at `http://localhost:30767/my-experiment`

## Data Preparation

### 1. Prepare your JSON file

Format:

```json
{
  "uuid1": [
    {
      "melody_GT": {
        "wav": "/absolute/path/to/gt.mp3",
        "lyrics": "original lyrics"
      }
    },
    {
      "rebuild_01": {
        "wav": "/absolute/path/to/rebuild.wav",
        "lyrics": "rebuild lyrics"
      }
    }
  ]
}
```

### 2. Copy audio files

Use the provided script to copy audio files and generate the processed JSON:

```bash
# Basic usage (default folder)
npm run copy-audio -- /path/to/data.json

# Specify experiment folder (accessible at /exp1)
npm run copy-audio -- /path/to/data.json -f exp1

# Multiple experiments
npm run copy-audio -- /data/baseline.json -f baseline
npm run copy-audio -- /data/model-v2.json -f model-v2
```

See [scripts/README.md](scripts/README.md) for detailed usage.

## Multi-Experiment Support

You can host multiple experiments simultaneously and access them via different URLs:

```bash
# Setup experiment 1
npm run copy-audio -- /data/exp1.json -f exp1

# Setup experiment 2
npm run copy-audio -- /data/exp2.json -f exp2
```

Access URLs:

- `http://localhost:30767/exp1` - Experiment 1
- `http://localhost:30767/exp2` - Experiment 2

Each experiment has:

- Isolated data loading
- Separate tag storage in localStorage
- Independent export functionality

## URL Routing

| URL Path    | Data Source                  | Use Case           |
| ----------- | ---------------------------- | ------------------ |
| `/`         | `/datas3/default/data.json`  | Default experiment |
| `/exp1`     | `/datas3/exp1/data.json`     | Experiment 1       |
| `/model-v2` | `/datas3/model-v2/data.json` | Model comparison   |

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
├── public/
│   ├── audio/              # Audio files (auto-generated)
│   └── data/               # Experiment data folders
│       ├── default/
│       ├── exp1/
│       └── ...
├── scripts/
│   └── copy-audio-files.cjs  # Audio file copy script
├── src/
│   ├── components/         # React components
│   ├── App.tsx            # Main app with routing logic
│   └── types.ts           # TypeScript types
└── vite.config.ts         # Vite configuration
```

## Exporting Tags

Tags are automatically saved to localStorage per experiment. You can export them as JSON by clicking the "Export" button in the header.

---

## Technical Details

This project uses:

- React + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- `diff` library for lyrics comparison

For ESLint configuration details, see the original [Vite React template documentation](https://vitejs.dev/guide/).
