# 🎵 Audio Evaluation Tools

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A powerful, web-based audio evaluation toolkit designed for comparing and assessing multiple audio variants side-by-side. Perfect for TTS (Text-to-Speech), SVS (Singing Voice Synthesis), music generation, and speech model evaluation.

![Audio Evaluation Tools Screenshot](https://via.placeholder.com/800x400?text=Audio+Evaluation+Tools+Screenshot)

## ✨ Features

- **🎧 Side-by-Side Comparison** - Compare multiple audio variants (Ground Truth, model outputs, etc.) in a clean grid layout
- **🏷️ Quality Tagging** - Tag audio quality with intuitive Good/Maybe/Bad ratings
- **💾 Persistent Storage** - Tags are automatically saved to localStorage with per-experiment isolation
- **📤 Export Results** - Export all tags and statistics as JSON for further analysis
- **📝 Lyrics Diff View** - Visual diff highlighting for lyrics comparison against Ground Truth
- **🔬 Multi-Experiment Support** - Run multiple experiments simultaneously via URL paths
- **📱 Responsive Design** - Works on desktop and tablet devices
- **⚡ Fast & Lightweight** - Built with Vite for lightning-fast development and builds

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.19+ or 22.12+ (recommended)
- **npm** or **yarn**

```bash
# Install Node.js via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd audio-evaluation-tools

# Install dependencies
npm install

# Prepare your audio data (see Data Preparation)
npm run copy-audio -- /path/to/your/data.json -f my-experiment

# Start development server
npm run dev
```

Open your browser at `http://localhost:30767/my-experiment`

## 📊 Data Preparation

### JSON Format

Your data file should follow this structure:

```json
{
  "uuid-1": [
    {
      "melody_GT": {
        "wav": "/absolute/path/to/gt.mp3",
        "lyrics": "Original lyrics here"
      }
    },
    {
      "rebuild_v1": {
        "wav": "/absolute/path/to/rebuild1.wav",
        "lyrics": "Rebuild lyrics here"
      }
    },
    {
      "rebuild_v2": {
        "wav": "/absolute/path/to/rebuild2.wav",
        "lyrics": "Another version"
      }
    }
  ],
  "uuid-2": [
    ...
  ]
}
```

**Notes:**
- Each UUID represents one comparison group
- `melody_GT` is treated specially as the "Ground Truth" reference
- Audio paths can be absolute local paths or HTTP/HTTPS URLs
- Multiple variants can be included per UUID

### Copy Audio Files

Use the provided script to copy audio files and generate the processed JSON:

```bash
# Basic usage - copies to default folder
npm run copy-audio -- /path/to/data.json

# Specify experiment folder (accessible at /exp1)
npm run copy-audio -- /path/to/data.json -f exp1

# Multiple experiments
npm run copy-audio -- /data/baseline.json -f baseline
npm run copy-audio -- /data/model-v2.json -f model-v2
```

The script will:
1. Copy all audio files to `public/audio/`
2. Generate a processed JSON with relative paths
3. Output to `public/data/{folder}/data.json`

See [scripts/README.md](scripts/README.md) for detailed usage.

## 🔬 Multi-Experiment Support

You can host multiple experiments simultaneously:

```bash
# Setup experiment 1
npm run copy-audio -- /data/exp1.json -f exp1

# Setup experiment 2
npm run copy-audio -- /data/exp2.json -f exp2
```

Access URLs:

| URL Path | Data Source | Use Case |
|----------|-------------|----------|
| `/` | `/data/default/data.json` | Default experiment |
| `/exp1` | `/data/exp1/data.json` | Experiment 1 |
| `/model-v2` | `/data/model-v2/data.json` | Model comparison |

Each experiment has:
- Isolated data loading
- Separate tag storage in localStorage
- Independent export functionality

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Project Structure

```
audio-evaluation-tools/
├── public/
│   ├── audio/              # Audio files (auto-generated)
│   ├── data/               # Experiment data folders
│   │   ├── default/
│   │   ├── exp1/
│   │   └── ...
│   ├── favicon.svg         # Favicon
│   └── logo.svg            # Logo
├── scripts/
│   └── copy-audio-files.cjs  # Audio file copy script
├── src/
│   ├── components/         # React components
│   │   ├── AudioComparisonRow.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── LyricsDisplay.tsx
│   │   └── TagButton.tsx
│   ├── utils/
│   │   └── diff.ts         # Lyrics diff utilities
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx            # Main application
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── LICENSE
└── CONTRIBUTING.md
```

## 📤 Exporting Tags

Tags are automatically saved to localStorage. Click the **Export** button in the header to download a JSON file containing:

```json
{
  "experiment": "my-experiment",
  "exportedAt": "2026-01-28T12:00:00.000Z",
  "tags": {
    "uuid-1": {
      "rebuild_v1": "good",
      "rebuild_v2": "bad"
    }
  },
  "summary": {
    "total": 2,
    "good": 1,
    "maybe": 0,
    "bad": 1
  }
}
```

## 🎨 Customization

### Styling

The project uses [Tailwind CSS](https://tailwindcss.com/). Customize the theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add your custom colors
      },
    },
  },
}
```

### Tag Options

Modify tag options in `src/components/TagButton.tsx`:

```typescript
const tagOptions = [
  { value: 'good', label: 'Good', ... },
  { value: 'maybe', label: 'Maybe', ... },
  { value: 'bad', label: 'Bad', ... },
  // Add your own tags
];
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Diff highlighting powered by [diff](https://github.com/kpdecker/jsdiff)

---

<p align="center">Made with ❤️ for the audio research community</p>
