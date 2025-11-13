# Quick GitHub Upload Guide

## What Folder to Upload?

**Upload the ENTIRE `peterart007` folder** - this is your complete project.

## Quick Steps

### 1. Open Command Prompt in Your Project Folder

```bash
cd C:\Users\Keshav\Desktop\peterart007
```

### 2. Initialize Git and Push to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Peter Art E-commerce Website"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

## What Gets Uploaded?

✅ **Uploaded:**
- All source code (`.tsx`, `.ts`, `.js`, `.css`)
- Configuration files (`package.json`, `next.config.js`, etc.)
- `data/` folder structure
- `public/artworks/` folder structure
- All components and API routes

❌ **NOT Uploaded** (automatically ignored):
- `node_modules/` (too large)
- `.env.local` (sensitive data)
- `.next/` (build folder)

## After Upload

1. Go to Railway.app
2. Connect your GitHub repository
3. Deploy!

