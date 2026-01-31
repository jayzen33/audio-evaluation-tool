# Audio Copy Script

This script copies audio files from your JSON data file to the project's `public/audio` directory and generates a processed JSON file with relative paths.

## Usage

```bash
node scripts/copy-audio-files.cjs <input-json-path> [options]
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--folder` | `-f` | Output folder name under `public/data/` | `default` |
| `--output` | `-o` | Output JSON filename | `data.json` |
| `--help` | `-h` | Show help message | - |

## Examples

### Basic Usage

Copy to default folder (accessible at `http://localhost:30767/`):

```bash
npm run copy-audio -- /path/to/data.json
```

### Specify Experiment Folder

Copy to `exp1` folder (accessible at `http://localhost:30767/exp1`):

```bash
npm run copy-audio -- /path/to/data.json -f exp1
```

### Custom Output Filename

```bash
npm run copy-audio -- /path/to/data.json -f model-v2 -o comparison.json
```

### Multiple Experiments

```bash
# Setup baseline
npm run copy-audio -- /data/baseline.json -f baseline

# Setup model v2
npm run copy-audio -- /data/model-v2.json -f model-v2

# Setup ablation study
npm run copy-audio -- /data/ablation.json -f ablation
```

## Input Format

The input JSON should have this structure:

```json
{
  "uuid-1": [
    {
      "melody_GT": {
        "wav": "/absolute/path/to/gt.mp3",
        "content": "Original transcript"
      }
    },
    {
      "variant_1": {
        "wav": "/absolute/path/to/variant1.wav",
        "content": "Variant transcript"
      }
    }
  ]
}
```

## Output

The script will:

1. Create `public/data/{folder}/` directory
2. Copy audio files to `public/audio/` with unique names
3. Generate `public/data/{folder}/{output}` with relative paths

## URL Mapping

| Folder (`-f`) | Access URL | Data File |
|---------------|------------|-----------|
| `default` | `/` | `/data/default/data.json` |
| `exp1` | `/exp1` | `/data/exp1/data.json` |
| `model-v2` | `/model-v2` | `/data/model-v2/data.json` |
