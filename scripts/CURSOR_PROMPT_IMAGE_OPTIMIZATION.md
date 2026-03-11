# Cursor AI Prompt: Image Optimization to WebP

Save this prompt and run it in any project to optimize all images to WebP format.

---

## 🎯 PROMPT TO COPY AND USE

```
Optimize all images in this project to SEO-friendly WebP format. Follow these steps:

**Step 1: Check ImageMagick**
- Verify ImageMagick is installed by running `magick -version`
- If not installed, inform me to install it first

**Step 2: Convert Images to WebP**
- Find all JPG, JPEG, and PNG files in:
  - `src/assets/` (and all subdirectories)
  - `public/` (excluding favicon files)
- Convert each to WebP using ImageMagick with these settings:
  - Quality: 85%
  - Strip all metadata
  - Max dimension: 2000px for regular images
  - Max dimension: 800px for logos and supplier images
  - Use webp:method=6 for best compression
  - Use lossless=false for smaller files
- Command format:
  ```
  magick input.jpg -strip -quality 85 -define webp:method=6 -define webp:lossless=false -resize '2000x2000>' output.webp
  ```

**Step 3: Update All Code References**
- Search and replace in all source files (.tsx, .ts, .jsx, .js, .css, .scss):
  - `.jpg` → `.webp`
  - `.jpeg` → `.webp`
  - `.png` → `.webp` (exclude favicon.png)
- Update:
  - Import statements: `import logo from "@/assets/logo.png"` → `import logo from "@/assets/logo.webp"`
  - URL references: `url('image.jpg')` → `url('image.webp')`
  - Schema markup URLs: `https://domain.com/image.png` → `https://domain.com/image.webp`
  - Any hardcoded image paths

**Step 4: Delete Original Files**
- Remove all original JPG, JPEG, PNG files from `src/assets/` and subdirectories
- Keep favicon files
- Only delete if corresponding .webp file exists

**Step 5: Verify**
- Count WebP files created
- Check that no broken imports remain
- Report file size savings

**Requirements:**
- Show progress for each conversion
- Display file size comparison (before → after)
- Report total files converted, skipped, and any failures
- Don't add try/catch or defensive checks
- Don't use dynamic imports
- Follow minimal-change rule (only modify necessary lines)

**Final Report Should Include:**
- Number of images converted
- Total file size saved
- Number of code files updated
- List of any files that failed to convert
```

---

## 📋 HOW TO USE THIS PROMPT

### Method 1: Quick Copy-Paste
1. Copy the prompt text above (between the triple backticks)
2. Open Cursor AI chat in any project
3. Paste and run
4. Let the AI do the work

### Method 2: Save as Cursor Composer Preset
1. Go to Cursor Settings → Features → Composer
2. Create a new "Image Optimization" preset
3. Paste the prompt
4. Use with: `Cmd+Shift+I` → Select "Image Optimization"

### Method 3: Save as Project Rule (Recommended)
1. Create `.cursorrules` file in your project root
2. Add this command shortcut:

```
# Image Optimization Command
When I say "optimize images", follow this process:
[PASTE THE PROMPT HERE]
```

3. Then in any project, just type: "optimize images"

### Method 4: Save as Global Cursor Rule
1. Go to: Cursor Settings → General → Rules for AI
2. Add the prompt with a trigger phrase
3. Use across all projects

---

## 🚀 EXAMPLE USAGE

### In Cursor Chat:
```
You: optimize images
```

Or paste the full prompt:
```
You: Optimize all images in this project to SEO-friendly WebP format...
[rest of prompt]
```

The AI will:
1. ✅ Check for ImageMagick
2. ✅ Convert all images to WebP
3. ✅ Update all code references
4. ✅ Delete original files
5. ✅ Provide a summary report

---

## 📊 EXPECTED OUTPUT

```
✅ Converted 24 images to WebP format

📦 File Size Savings:
- hero-vineyard.jpg: 1.2MB → 368KB (69% smaller)
- logo.png: 620KB → 60KB (90% smaller)
- product-1.jpg: 850KB → 156KB (82% smaller)
... (21 more)

Total saved: 8.4MB → 2.1MB (75% reduction)

📝 Updated code in 12 files:
- src/components/Header.tsx
- src/components/Footer.tsx
- src/pages/Index.tsx
... (9 more)

🗑️ Deleted 24 original JPG/PNG files

✨ Optimization complete!
```

---

## 🎨 VARIATIONS

### High Quality (for portfolios/photography sites)
```
... Quality: 95% ...
```

### Maximum Compression (for large sites)
```
... Quality: 75% ...
Max dimension: 1600px ...
```

### Logos Only
```
Convert only logo and icon files in src/assets/logos/ to WebP
Quality: 80%, Max dimension: 500px
```

---

## 💡 PRO TIPS

1. **Before Running**: Commit your current work
   ```bash
   git add . && git commit -m "Before image optimization"
   ```

2. **Test First**: Run on a test branch
   ```bash
   git checkout -b optimize-images
   ```

3. **Review Changes**: Check the diff before committing
   ```bash
   git diff
   ```

4. **Selective Optimization**: Modify the prompt to target specific folders
   ```
   Only optimize images in src/assets/products/ folder
   ```

5. **Preserve Specific Files**: Add exclusions
   ```
   Exclude files matching: screenshot-*.png, favicon.*, og-image.*
   ```

---

## 🔧 CUSTOMIZATION

### Change Quality Per Image Type
```
Use quality 90% for product images
Use quality 80% for background images  
Use quality 75% for thumbnails
```

### Different Max Dimensions
```
Max dimension 2500px for hero images
Max dimension 1200px for content images
Max dimension 600px for thumbnails
```

### Only Convert Specific Folders
```
Only convert images in:
- src/assets/products/
- src/assets/team/
Skip all other folders
```

---

## 📝 SAVE THIS PROMPT

### Option A: Save to Project
Create: `scripts/prompts/optimize-images.txt`

### Option B: Save to Cursor
Settings → Prompts → New Prompt → Paste

### Option C: Personal Knowledge Base
Save in your notes with tag: `#cursor-prompts #image-optimization`

---

## ✅ CHECKLIST

After running the prompt, verify:
- [ ] All images converted to WebP
- [ ] No broken import statements
- [ ] App builds without errors
- [ ] Images display correctly in browser
- [ ] File sizes significantly reduced
- [ ] Original files removed (if desired)

---

## 🔄 UPDATE THIS PROMPT

Feel free to modify for your needs:
- Change default quality
- Add/remove file types
- Include additional folders
- Add specific exclusions
- Customize output format

---

## 📚 RELATED PROMPTS

Create similar prompts for:
- "optimize fonts" - Convert to WOFF2
- "optimize SVGs" - Minify and clean SVG files
- "generate responsive images" - Create multiple sizes
- "audit performance" - Check image loading performance

---

**Last Updated**: 2025-11-05
**Compatible With**: Cursor AI, Claude, GPT-4
**Project Type**: Any web project (React, Next.js, Vue, etc.)






