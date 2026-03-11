# Image Optimization Script - Usage Guide

This script converts all JPG/JPEG/PNG images in your project to SEO-optimized WebP format, updates code references, and optionally removes original files.

## Features

✅ **Automatic Conversion**: Converts all JPG/JPEG/PNG to WebP with optimal compression  
✅ **Code Updates**: Automatically updates imports and references in your codebase  
✅ **SEO Optimized**: Strips metadata, optimizes file size, limits dimensions  
✅ **Safe**: Asks before deleting original files  
✅ **Reusable**: Can be used on any project  

## Prerequisites

Install ImageMagick:

```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Verify installation
magick -version
```

## Quick Start

### Option 1: Run from project root

```bash
cd /path/to/your/project
chmod +x scripts/optimize-images-to-webp.sh
./scripts/optimize-images-to-webp.sh
```

### Option 2: Run with custom settings

```bash
./scripts/optimize-images-to-webp.sh /path/to/project 80
#                                    ↑               ↑
#                                    Project path    Quality (1-100)
```

### Option 3: Save as global command

Create a global command you can run from anywhere:

```bash
# Copy to your local bin
cp scripts/optimize-images-to-webp.sh ~/bin/optimize-images

# Make executable
chmod +x ~/bin/optimize-images

# Use from any project
cd /any/project
optimize-images
```

## What It Does

### 1. **Converts Images**
- Finds all `.jpg`, `.jpeg`, `.png` files in `src/assets` and `public` folders
- Converts to WebP with 85% quality (configurable)
- Limits image dimensions to 2000px (logos to 800px)
- Strips all metadata for smaller file sizes
- Uses lossless=false for better compression

### 2. **Updates Code**
Automatically updates references in:
- `*.tsx`, `*.ts` files (React/TypeScript)
- `*.jsx`, `*.js` files (React/JavaScript)
- `*.css`, `*.scss` files (Stylesheets)

Changes:
```diff
- import logo from "@/assets/logo.png"
+ import logo from "@/assets/logo.webp"

- background-image: url('/hero.jpg')
+ background-image: url('/hero.webp')
```

### 3. **Cleans Up**
- Asks for confirmation before deleting originals
- Only deletes files that have successful WebP versions
- Skips `favicon.png` and other critical files

## Configuration

### Quality Settings

```bash
# High quality (larger files)
./optimize-images-to-webp.sh . 95

# Balanced (recommended)
./optimize-images-to-webp.sh . 85

# Smaller files
./optimize-images-to-webp.sh . 75
```

### Customize Max Dimensions

Edit the script variables:

```bash
MAX_DIMENSION="2000"        # Max size for regular images
LOGO_MAX_DIMENSION="800"    # Max size for logos
```

## Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️  Image Optimization to WebP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Root: /Users/you/project
Quality: 85%
Max Dimension: 2000px

📁 Step 1: Converting Images
🔄 Converting: src/assets/hero.jpg
✅ Created: src/assets/hero.webp (1.2M → 368K)

📝 Step 2: Updating Code References
✅ Updated 12 files

🗑️  Step 3: Removing Original Files
Delete original JPG/PNG files? (y/N): y
✅ Deleted 24 original files

📊 Final Summary
  ✅ Converted:     24 images
  ⏭️  Skipped:      3 images
  ❌ Failed:       0 images
  📝 Code Updated:  12 files

✨ Optimization complete!
```

## Safety Features

1. **Confirmation Required**: Always asks before deleting files
2. **Skip Existing**: Won't re-convert if WebP is newer
3. **Verify Success**: Only deletes originals if WebP exists
4. **Preserve Favicons**: Automatically skips favicon files
5. **Error Handling**: Reports failed conversions

## Use Cases

### New Project Setup
```bash
# Run once to optimize all images
./scripts/optimize-images-to-webp.sh
```

### After Adding New Images
```bash
# Re-run to convert new images (skips existing)
./scripts/optimize-images-to-webp.sh
```

### Different Projects
```bash
# Save script globally and use anywhere
optimize-images /path/to/project1
optimize-images /path/to/project2
```

## Expected Results

### File Size Reduction
- **Photos**: 60-80% smaller
- **Graphics**: 40-60% smaller  
- **Logos**: 70-90% smaller

### Example Savings
```
hero-image.jpg:        1.2MB → 368KB  (69% reduction)
product-photo.jpg:     850KB → 156KB  (82% reduction)
company-logo.png:      620KB → 60KB   (90% reduction)
```

## Troubleshooting

### Script won't run
```bash
chmod +x scripts/optimize-images-to-webp.sh
```

### ImageMagick not found
```bash
# Install ImageMagick first
brew install imagemagick  # macOS
```

### Code not updating
- Check file permissions
- Ensure you're using macOS/Linux (script uses `sed`)
- Windows users: use WSL or Git Bash

## Tips

1. **Test First**: Run on a test branch before production
2. **Commit Before**: Commit your work before running
3. **Review Changes**: Check git diff to verify updates
4. **Quality Balance**: 85% quality is optimal for web
5. **Logos Need Less**: Set lower quality for logos (75-80%)

## Integration with CI/CD

Add to package.json:

```json
{
  "scripts": {
    "optimize:images": "./scripts/optimize-images-to-webp.sh . 85"
  }
}
```

Run with:
```bash
npm run optimize:images
```

## License

Free to use and modify for any project.

