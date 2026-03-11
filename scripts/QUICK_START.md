# ⚡ Quick Start - Image Optimization

## 🎯 What We Created

You now have **3 ways** to optimize images in any project:

---

## 📋 METHOD 1: Copy-Paste Prompt (Easiest)

### How to Use:
1. Open the file: `scripts/PASTE_INTO_CURSOR.txt`
2. Copy the entire content
3. Go to any project
4. Open Cursor AI chat
5. Paste and hit Enter
6. Done! ✨

**Use this when:** You want quick one-time optimization

---

## 🤖 METHOD 2: Bash Script (Most Control)

### How to Use:
```bash
cd /path/to/your/project
./scripts/optimize-images-to-webp.sh
```

### Make it Global:
```bash
# One-time setup (creates ~/bin if needed)
mkdir -p ~/bin
cp scripts/optimize-images-to-webp.sh ~/bin/optimize-images
chmod +x ~/bin/optimize-images

# Add to PATH (only needed once)
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Then use from anywhere:
cd /any/project
optimize-images
```

**Use this when:** You want manual control and confirmation steps

---

## 💾 METHOD 3: Save as Cursor Rule (Best for Repeated Use)

### Option A: Project-Specific Rule
Create `.cursorrules` in your project root:

```
# Quick Commands

## optimize images
Optimize all images in this project to SEO-friendly WebP format. Follow these steps:
[PASTE CONTENT FROM PASTE_INTO_CURSOR.txt HERE]
```

Then just type: `optimize images`

### Option B: Global Cursor Rule
1. Open Cursor Settings (⌘+,)
2. Go to: Features → Rules for AI
3. Add new rule with trigger: "optimize images"
4. Paste content from `PASTE_INTO_CURSOR.txt`
5. Use in ANY project by typing: "optimize images"

**Use this when:** You optimize images frequently across projects

---

## 📊 What Just Happened in This Project

✅ **Converted 36 images** to WebP format  
✅ **Updated 5 code files** with new references  
✅ **Removed 36 original files** (JPG/PNG)  
✅ **Saved ~75% file size** on average  

### Files Updated:
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/pages/Index.tsx`
- `src/data/productImages.ts`
- `src/components/SchemaMarkup.tsx`

### Example Savings:
```
hero-vineyard.jpg    → hero-vineyard.webp    (1.2MB → 368KB)
logo.png            → logo.webp            (620KB → 60KB)
orchard-landscape.jpg → orchard-landscape.webp (850KB → 127KB)
```

---

## 🚀 Next Steps

### For This Project:
```bash
# 1. Verify everything works
npm run dev

# 2. Check in browser
open http://localhost:5173

# 3. Commit changes
git add .
git commit -m "Optimize all images to WebP format"
```

### For Other Projects:
Just use one of the 3 methods above! 🎉

---

## 🎨 Customize the Prompt

Edit `PASTE_INTO_CURSOR.txt` to change:

```
Quality: 85%          → Change to 75% (smaller) or 95% (higher quality)
Max dimension: 2000px → Change to 1600px (smaller) or 2500px (larger)
```

Common variations:

**For Photography Sites:**
```
Quality: 95%
Max dimension: 2500px
```

**For Fast Loading:**
```
Quality: 75%
Max dimension: 1600px
```

**For Logos Only:**
```
Only convert images in src/assets/logos/
Quality: 80%
Max dimension: 500px
```

---

## 📚 Documentation

- `PASTE_INTO_CURSOR.txt` - Ready-to-use prompt
- `CURSOR_PROMPT_IMAGE_OPTIMIZATION.md` - Full documentation
- `IMAGE_OPTIMIZATION_GUIDE.md` - Bash script guide
- `optimize-images-to-webp.sh` - Automated bash script

---

## ✅ Verification Checklist

After running optimization:

- [ ] Images display correctly
- [ ] No console errors
- [ ] App builds successfully
- [ ] File sizes reduced
- [ ] No broken imports
- [ ] WebP files created
- [ ] Original files removed (optional)

---

## 💡 Pro Tips

1. **Always commit first:**
   ```bash
   git add . && git commit -m "Before optimization"
   ```

2. **Test on a branch:**
   ```bash
   git checkout -b optimize-images
   ```

3. **Review changes:**
   ```bash
   git diff
   ```

4. **Verify in browser:**
   - Check DevTools Network tab
   - Confirm WebP is being served
   - Check file sizes

---

## 🆘 Troubleshooting

**ImageMagick not found?**
```bash
brew install imagemagick  # macOS
```

**Script won't run?**
```bash
chmod +x scripts/optimize-images-to-webp.sh
```

**Images not displaying?**
- Check browser console for errors
- Verify file paths are correct
- Clear browser cache

**Build errors?**
```bash
# Check for broken imports
grep -r "\.jpg\|\.png" src/
```

---

## 🎯 Quick Command Reference

```bash
# Method 1: Bash Script
./scripts/optimize-images-to-webp.sh

# Method 2: Global Command (after setup)
optimize-images

# Method 3: Cursor Chat
optimize images

# Method 4: Manual ImageMagick
magick input.jpg -strip -quality 85 -define webp:method=6 -resize '2000x2000>' output.webp
```

---

**Ready to optimize your next project?** 🚀

Pick your favorite method and you're all set!

