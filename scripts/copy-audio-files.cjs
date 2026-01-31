#!/usr/bin/env node

/**
 * Copy Audio Files Script
 * 
 * This script reads a JSON file containing audio file paths,
 * copies the audio files to the public/audio directory,
 * and generates a new JSON file with relative paths.
 * 
 * Usage:
 *   node scripts/copy-audio-files.cjs <input-json-path> [options]
 * 
 * Options:
 *   -f, --folder <name>   Output folder name under public/datas3/ (default: 'default')
 *                        This becomes the URL path: http://localhost:5173/<folder-name>
 *   -o, --output <name>   Output JSON filename (default: 'data.json')
 * 
 * Examples:
 *   # Copy to default folder (accessible at http://localhost:5173/)
 *   node scripts/copy-audio-files.cjs /path/to/data.json
 * 
 *   # Copy to exp1 folder (accessible at http://localhost:5173/exp1)
 *   node scripts/copy-audio-files.cjs /path/to/data.json -f exp1
 * 
 *   # Copy to model-v2 folder with custom output name
 *   node scripts/copy-audio-files.cjs /path/to/data.json -f model-v2 -o comparison.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 1 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(args.length < 1 ? 1 : 0);
  }

  const inputPath = path.resolve(args[0]);
  let folderName = 'default';
  let outputName = 'data.json';

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '-f' || arg === '--folder') {
      if (nextArg && !nextArg.startsWith('-')) {
        folderName = nextArg;
        i++; // Skip next arg
      } else {
        console.error('❌ Error: --folder requires a value');
        process.exit(1);
      }
    } else if (arg === '-o' || arg === '--output') {
      if (nextArg && !nextArg.startsWith('-')) {
        outputName = nextArg;
        i++; // Skip next arg
      } else {
        console.error('❌ Error: --output requires a value');
        process.exit(1);
      }
    }
  }

  // Validate folder name (prevent directory traversal)
  if (folderName.includes('..') || folderName.includes('/') || folderName.includes('\\')) {
    console.error('❌ Error: Folder name cannot contain "..", "/", or "\\"');
    process.exit(1);
  }

  return { inputPath, folderName, outputName };
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
Audio Files Copy Script

Usage:
  node scripts/copy-audio-files.cjs <input-json-path> [options]

Options:
  -f, --folder <name>   Output folder name under public/data/ (default: 'default')
                        This becomes the URL path: http://localhost:5173/<folder-name>
  -o, --output <name>   Output JSON filename (default: 'data.json')
  -h, --help            Show this help message

Examples:
  # Copy to default folder (accessible at http://localhost:5173/)
  node scripts/copy-audio-files.cjs /path/to/data.json

  # Copy to exp1 folder (accessible at http://localhost:5173/exp1)
  node scripts/copy-audio-files.cjs /path/to/data.json -f exp1

  # Copy to model-v2 folder with custom output name
  node scripts/copy-audio-files.cjs /path/to/data.json -f model-v2 -o comparison.json

  # Using npm script
  npm run copy-audio -- /path/to/data.json -f exp1
`);
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Copy file from source to destination
 */
function copyFile(srcPath, destPath) {
  try {
    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️  Source file not found: ${srcPath}`);
      return false;
    }
    
    // Create destination directory if needed
    const destDir = path.dirname(destPath);
    ensureDir(destDir);
    
    // Copy file
    fs.copyFileSync(srcPath, destPath);
    return true;
  } catch (err) {
    console.error(`❌ Failed to copy file: ${srcPath} -> ${destPath}`);
    console.error(err.message);
    return false;
  }
}

/**
 * Generate unique filename to avoid collisions
 */
function generateUniqueFilename(uuid, variantKey, originalPath) {
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);
  // Include uuid and variant to ensure uniqueness
  return `${uuid}_${variantKey}_${base}${ext}`.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Process JSON data and copy audio files
 */
function processJsonData(jsonData, folderName) {
  const copiedFiles = [];
  const failedFiles = [];
  const processedData = {};

  // Iterate over each UUID in the data
  for (const [uuid, variantsArray] of Object.entries(jsonData)) {
    if (!Array.isArray(variantsArray)) {
      console.warn(`⚠️  Invalid data format for UUID: ${uuid}`);
      continue;
    }

    processedData[uuid] = [];

    // Process each variant
    for (const variantObj of variantsArray) {
      const processedVariant = {};

      for (const [variantKey, audioData] of Object.entries(variantObj)) {
        if (!audioData || typeof audioData !== 'object') {
          processedVariant[variantKey] = audioData;
          continue;
        }

        const { wav, content } = audioData;
        
        if (!wav || typeof wav !== 'string') {
          processedVariant[variantKey] = audioData;
          continue;
        }

        // Skip URLs (already hosted)
        if (wav.startsWith('http://') || wav.startsWith('https://')) {
          processedVariant[variantKey] = audioData;
          continue;
        }

        // Generate destination filename with folder prefix for organization
        const destFilename = generateUniqueFilename(uuid, variantKey, wav);
        const destPath = path.join(AUDIO_DIR, destFilename);
        const publicRelativePath = `/audio/${destFilename}`;

        // Copy the file
        console.log(`📄 Copying: ${wav}`);
        console.log(`   -> ${destPath}`);
        
        const success = copyFile(wav, destPath);
        
        if (success) {
          copiedFiles.push({ source: wav, dest: destPath });
        } else {
          failedFiles.push({ source: wav, uuid, variant: variantKey });
        }

        // Update the path in the processed data
        processedVariant[variantKey] = {
          wav: publicRelativePath,
          content: content || ''
        };
      }

      processedData[uuid].push(processedVariant);
    }
  }

  return { processedData, copiedFiles, failedFiles };
}

/**
 * Main function
 */
function main() {
  const { inputPath, folderName, outputName } = parseArgs();
  
  // Construct output path
  const outputDir = path.join(PUBLIC_DIR, 'data', folderName);
  const outputPath = path.join(outputDir, outputName);

  console.log('========================================');
  console.log('Audio Files Copy Script');
  console.log('========================================');
  console.log(`Input JSON:  ${inputPath}`);
  console.log(`Folder:      ${folderName}`);
  console.log(`Output JSON: ${outputPath}`);
  console.log(`Audio Dir:   ${AUDIO_DIR}`);
  console.log('----------------------------------------');
  const port = process.env.VITE_PORT || '5173';
  console.log(`Access URL:  http://localhost:${port}/${folderName === 'default' ? '' : folderName}`);
  if (folderName === 'default') {
    console.log(`Data URL:    /data/default/data.json`);
  } else {
    console.log(`Data URL:    /data/${folderName}/data.json`);
  }
  console.log('----------------------------------------\n');

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Ensure output directories exist
  ensureDir(outputDir);
  ensureDir(AUDIO_DIR);

  // Read and parse JSON
  let jsonData;
  try {
    const content = fs.readFileSync(inputPath, 'utf-8');
    jsonData = JSON.parse(content);
  } catch (err) {
    console.error(`❌ Failed to parse JSON file: ${inputPath}`);
    console.error(err.message);
    process.exit(1);
  }

  // Process data and copy files
  console.log('Processing audio files...\n');
  const { processedData, copiedFiles, failedFiles } = processJsonData(jsonData, folderName);

  // Write output JSON
  try {
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
    console.log(`\n✅ Output JSON written to: ${outputPath}`);
  } catch (err) {
    console.error(`\n❌ Failed to write output JSON: ${outputPath}`);
    console.error(err.message);
    process.exit(1);
  }

  // Print summary
  console.log('\n========================================');
  console.log('Summary');
  console.log('========================================');
  console.log(`Total files processed: ${copiedFiles.length + failedFiles.length}`);
  console.log(`✅ Successfully copied: ${copiedFiles.length}`);
  console.log(`❌ Failed: ${failedFiles.length}`);

  if (failedFiles.length > 0) {
    console.log('\nFailed files:');
    failedFiles.forEach(({ source, uuid, variant }) => {
      console.log(`  - ${uuid}/${variant}: ${source}`);
    });
  }

  console.log('\n========================================');
  console.log('Next Steps');
  console.log('========================================');
  console.log(`1. Add audio files (optional)`);
  console.log(`2. Start dev server: npm run dev`);
  console.log(`3. Open browser: http://localhost:${port}/${folderName === 'default' ? '' : folderName}`);
  console.log('\n✨ Done!');
}

// Run main function
main();
