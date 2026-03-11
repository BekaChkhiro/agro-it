#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const SOURCE_DIR = path.join(__dirname, '..', 'src', 'assets');
const DIST_DIR = path.join(__dirname, '..', 'dist', 'assets');

async function convertImageToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`✓ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${path.basename(inputPath)}:`, error.message);
  }
}

async function processDirectory(dirPath, isDist = false) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await processDirectory(filePath, isDist);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        const baseName = path.basename(file, ext);
        const webpPath = path.join(dirPath, baseName + '.webp');

        if (!fs.existsSync(webpPath)) {
          await convertImageToWebP(filePath, webpPath);
        } else {
          console.log(`⏭️  Skipped (already exists): ${baseName}.webp`);
        }
      }
    }
  }
}

async function main() {
  console.log('🔄 Converting images to WebP format...\n');

  try {
    // Process source assets
    if (fs.existsSync(SOURCE_DIR)) {
      console.log('📁 Processing source assets...');
      await processDirectory(SOURCE_DIR);
    }

    // Process dist assets if they exist
    if (fs.existsSync(DIST_DIR)) {
      console.log('📁 Processing dist assets...');
      await processDirectory(DIST_DIR, true);
    }

    console.log('\n✅ Image conversion completed!');
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertImageToWebP };
