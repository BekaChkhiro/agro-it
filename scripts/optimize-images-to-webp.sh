#!/bin/bash

################################################################################
# Image Optimization Script - Convert JPG/PNG to SEO-Optimized WebP
################################################################################
# This script converts all JPG/JPEG/PNG images to WebP format with SEO optimization
# Updates code references from .jpg/.png to .webp
# Removes original files after successful conversion
#
# Usage:
#   ./optimize-images-to-webp.sh [PROJECT_ROOT] [QUALITY]
#
# Arguments:
#   PROJECT_ROOT: Path to project root (default: current directory)
#   QUALITY: WebP quality 1-100 (default: 85)
#
# Example:
#   ./optimize-images-to-webp.sh /path/to/project 85
################################################################################

set -e

# Configuration
PROJECT_ROOT="${1:-$(pwd)}"
QUALITY="${2:-85}"
MAX_DIMENSION="2000"
LOGO_MAX_DIMENSION="800"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
converted=0
skipped=0
failed=0
code_updated=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🖼️  Image Optimization to WebP${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Project Root: $PROJECT_ROOT"
echo "Quality: ${QUALITY}%"
echo "Max Dimension: ${MAX_DIMENSION}px"
echo ""

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick is not installed${NC}"
    echo "Please install ImageMagick first:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Function to convert image to WebP
convert_to_webp() {
    local input_file="$1"
    local max_dim="$2"
    local output_file="${input_file%.*}.webp"
    
    # Skip if WebP already exists and is newer
    if [ -f "$output_file" ] && [ "$output_file" -nt "$input_file" ]; then
        echo -e "${YELLOW}⏭️  Skipping (WebP is newer): $input_file${NC}"
        ((skipped++))
        return 0
    fi
    
    echo -e "${BLUE}🔄 Converting: $input_file${NC}"
    
    # Convert with SEO optimization
    if magick "$input_file" \
        -strip \
        -quality "${QUALITY}" \
        -define webp:method=6 \
        -define webp:lossless=false \
        -resize "${max_dim}x${max_dim}>" \
        "$output_file" 2>/dev/null; then
        
        # Get file sizes
        if [ -f "$input_file" ] && [ -f "$output_file" ]; then
            original_size=$(du -h "$input_file" | cut -f1)
            new_size=$(du -h "$output_file" | cut -f1)
            
            echo -e "${GREEN}✅ Created: $output_file ($original_size → $new_size)${NC}"
            ((converted++))
            return 0
        else
            echo -e "${RED}❌ Failed: Could not verify output${NC}"
            ((failed++))
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to convert: $input_file${NC}"
        ((failed++))
        return 1
    fi
}

# Function to update code references
update_code_references() {
    local extension="$1"
    local find_path="$2"
    
    echo ""
    echo -e "${BLUE}🔍 Updating code references from .$extension to .webp...${NC}"
    
    # Find all source files (tsx, ts, jsx, js, css, scss)
    local source_files=$(find "$find_path" -type f \( \
        -name "*.tsx" -o -name "*.ts" -o \
        -name "*.jsx" -o -name "*.js" -o \
        -name "*.css" -o -name "*.scss" \
    \) ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.next/*")
    
    local count=0
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Use sed to replace extensions (macOS compatible)
            if sed -i '' "s/\\.${extension}/.webp/g" "$file" 2>/dev/null; then
                # Check if file was actually modified
                if grep -q "\.webp" "$file" 2>/dev/null; then
                    ((count++))
                fi
            fi
        fi
    done <<< "$source_files"
    
    if [ $count -gt 0 ]; then
        echo -e "${GREEN}✅ Updated $count files${NC}"
        ((code_updated+=count))
    fi
}

# Step 1: Convert images in src/assets or public folders
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📁 Step 1: Converting Images${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Convert main assets
if [ -d "$PROJECT_ROOT/src/assets" ]; then
    echo "Processing src/assets..."
    while IFS= read -r -d '' file; do
        # Check if it's a logo file
        if [[ "$file" == *"logo"* ]] || [[ "$file" == *"supplier"* ]]; then
            convert_to_webp "$file" "$LOGO_MAX_DIMENSION"
        else
            convert_to_webp "$file" "$MAX_DIMENSION"
        fi
    done < <(find "$PROJECT_ROOT/src/assets" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -name "favicon*" -print0)
fi

# Convert public folder (exclude favicon)
if [ -d "$PROJECT_ROOT/public" ]; then
    echo "Processing public folder..."
    while IFS= read -r -d '' file; do
        convert_to_webp "$file" "$MAX_DIMENSION"
    done < <(find "$PROJECT_ROOT/public" -maxdepth 2 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -name "favicon*" -print0)
fi

# Step 2: Update code references
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Step 2: Updating Code References${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

update_code_references "jpg" "$PROJECT_ROOT/src"
update_code_references "jpeg" "$PROJECT_ROOT/src"
update_code_references "png" "$PROJECT_ROOT/src"

# Step 3: Remove original files
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🗑️  Step 3: Removing Original Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Delete original JPG/PNG files? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    deleted=0
    
    # Delete from src/assets
    if [ -d "$PROJECT_ROOT/src/assets" ]; then
        while IFS= read -r file; do
            # Only delete if corresponding .webp exists
            webp_file="${file%.*}.webp"
            if [ -f "$webp_file" ]; then
                echo -e "${YELLOW}🗑️  Deleting: $file${NC}"
                rm "$file"
                ((deleted++))
            fi
        done < <(find "$PROJECT_ROOT/src/assets" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -name "favicon*")
    fi
    
    # Delete from public folder
    if [ -d "$PROJECT_ROOT/public" ]; then
        while IFS= read -r file; do
            webp_file="${file%.*}.webp"
            if [ -f "$webp_file" ]; then
                echo -e "${YELLOW}🗑️  Deleting: $file${NC}"
                rm "$file"
                ((deleted++))
            fi
        done < <(find "$PROJECT_ROOT/public" -maxdepth 2 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -name "favicon*")
    fi
    
    echo ""
    echo -e "${GREEN}✅ Deleted $deleted original files${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped deletion${NC}"
fi

# Final Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Final Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}✅ Converted:${NC}     $converted images"
echo -e "  ${YELLOW}⏭️  Skipped:${NC}      $skipped images"
echo -e "  ${RED}❌ Failed:${NC}       $failed images"
echo -e "  ${BLUE}📝 Code Updated:${NC}  $code_updated files"
echo ""
echo -e "${GREEN}✨ Optimization complete!${NC}"
echo ""

# Exit with error if any conversions failed
if [ $failed -gt 0 ]; then
    exit 1
fi

exit 0






