# 🎵 Audio Evaluation Tools

A web-based toolkit for audio quality evaluation, supporting comparison tagging, AB testing, and MOS scoring.

## Features

- **Comparison** - Tag audio variants as Good/Maybe/Bad with content diff
- **AB Test** - Blind or labeled preference testing
- **MOS Scoring** - Rate audio quality on 1-5 scale
- **Multi-Experiment** - Run multiple experiments via URL paths
- **Persistent Storage** - Auto-saved to localStorage
- **Export Results** - Download JSON with statistics

## Demo

Try the live demo: https://jayzen33.github.io/audio-evaluation-tool/

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

## Deploy to GitHub Pages

### Option 1: Manual Deploy

```bash
# Build for GitHub Pages
npm run build:gh-pages

# Deploy dist folder to gh-pages branch
npx gh-pages -d dist
```

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build:gh-pages
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Configuration

1. Go to **Settings → Pages** in your GitHub repository
2. Set **Source** to "GitHub Actions"
3. Update `homepage` in `package.json` if using a different repo name:
   ```json
   "homepage": "https://<username>.github.io/<repo-name>/"
   ```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run build:gh-pages  # Build for GitHub Pages
npm run lint     # Run linter
```

## License

See [LICENSE](LICENSE) file for details.
