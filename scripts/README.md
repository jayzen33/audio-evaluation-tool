# Audio Files Copy Script

This script copies audio files from absolute paths (specified in JSON) to the `public/audio/` directory, making them accessible to the web application. It also supports organizing experiments into separate folders for side-by-side comparison.

## Features

- Copy audio files from absolute paths to the public directory
- Organize multiple experiments in separate folders
- Each folder corresponds to a unique URL path (e.g., `/exp1`, `/model-v2`)
- Isolated tag storage per experiment in localStorage

## Usage

### Basic Usage

```bash
node scripts/copy-audio-files.cjs <input-json-path> [options]
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--folder` | `-f` | Output folder name under `public/data/` | `default` |
| `--output` | `-o` | Output JSON filename | `data.json` |
| `--help` | `-h` | Show help message | - |

### Using npm script

```bash
npm run copy-audio -- <input-json-path> [options]
```

## Examples

### Example 1: Default folder (accessible at root URL)

```bash
npm run copy-audio -- /path/to/data.json
```

Access at: `http://localhost:30767/`

### Example 2: Experiment folder (exp1)

```bash
npm run copy-audio -- /path/to/exp1-data.json -f exp1
```

Access at: `http://localhost:30767/exp1`

### Example 3: Model comparison folder

```bash
npm run copy-audio -- /path/to/model-v2.json -f model-v2
```

Access at: `http://localhost:30767/model-v2`

### Example 4: Custom output filename

```bash
npm run copy-audio -- /path/to/data.json -f exp1 -o comparison.json
```

### Example 5: Multiple experiments setup

```bash
# Setup experiment 1: baseline model
npm run copy-audio -- /data/baseline.json -f baseline

# Setup experiment 2: improved model
npm run copy-audio -- /data/model-v2.json -f model-v2

# Setup experiment 3: ablation study
npm run copy-audio -- /data/ablation.json -f ablation
```

Then access:
- `http://localhost:30767/baseline` - Baseline results
- `http://localhost:30767/model-v2` - Improved model results
- `http://localhost:30767/ablation` - Ablation study results

## Directory Structure

After running the script, the directory structure will be:

```
public/
├── audio/                    # All audio files (shared across experiments)
│   ├── uuid1_variant1_file1.mp3
│   ├── uuid1_variant2_file2.wav
│   └── ...
└── data/
    ├── default/              # Default experiment
    │   └── data.json
    ├── exp1/                 # Experiment 1
    │   └── data.json
    ├── model-v2/             # Experiment 2
    │   └── data.json
    └── ablation/             # Experiment 3
        └── data.json
```

## Input JSON Format

```json
{
  "uuid1": [
    {
      "melody_GT": {
        "wav": "/absolute/path/to/file.mp3",
        "lyrics": "lyrics text"
      }
    },
    {
      "rebuild_01": {
        "wav": "/absolute/path/to/file.wav",
        "lyrics": "lyrics text"
      }
    }
  ]
}
```

## Output JSON Format

```json
{
  "uuid1": [
    {
      "melody_GT": {
        "wav": "/audio/uuid1_melody_GT_file.mp3",
        "lyrics": "lyrics text"
      }
    },
    {
      "rebuild_01": {
        "wav": "/audio/uuid1_rebuild_01_file.wav",
        "lyrics": "lyrics text"
      }
    }
  ]
}
```

## URL Routing

The application uses the URL path to determine which experiment data to load:

| URL Path | Data File Loaded | Tags Storage Key |
|----------|------------------|------------------|
| `/` or empty | `/data/default/data.json` | `audio_comparison_tags_default` |
| `/exp1` | `/data/exp1/data.json` | `audio_comparison_tags_exp1` |
| `/model-v2` | `/data/model-v2/data.json` | `audio_comparison_tags_model-v2` |

## Tag Isolation

Each experiment has its own isolated tags in localStorage:

- Tags are saved separately for each experiment
- Export filenames include the experiment name
- Clearing tags only affects the current experiment

## Complete Workflow

### 1. Prepare your data

Create JSON files for each experiment/model you want to compare.

### 2. Copy audio files for each experiment

```bash
# Experiment 1
npm run copy-audio -- /data/exp1.json -f exp1

# Experiment 2
npm run copy-audio -- /data/exp2.json -f exp2
```

### 3. Start the dev server

```bash
npm run dev
```

### 4. Open multiple browser tabs

- `http://localhost:30767/exp1`
- `http://localhost:30767/exp2`

### 5. Compare results

Each tab shows a different experiment. Tags are saved independently per experiment.

## Notes

- Folder names should not contain `..`, `/`, or `\` characters
- All audio files are stored in a shared `public/audio/` directory
- Audio files are renamed to avoid collisions: `{uuid}_{variantKey}_{original_filename}`
- If a source file doesn't exist, a warning is shown but processing continues
- URLs (http:// or https://) are not copied and remain unchanged
