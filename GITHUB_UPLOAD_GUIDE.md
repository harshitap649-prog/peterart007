# GitHub Upload Guide

## What to Upload to GitHub

**Upload the ENTIRE `peterart007` folder** - this is your complete project.

## Step-by-Step Instructions

### 1. Open Terminal/Command Prompt in Your Project Folder

Navigate to your project:
```bash
cd C:\Users\Keshav\Desktop\peterart007
```

### 2. Initialize Git (if not already done)

```bash
git init
```

### 3. Add All Files

```bash
git add .
```

This adds all files except those in `.gitignore` (like `node_modules`, `.env.local`, etc.)

### 4. Commit Your Code

```bash
git commit -m "Initial commit - Peter Art E-commerce Website"
```

### 5. Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `peterart007` (or any name you prefer)
3. Description: "Artwork E-commerce Website with Admin Panel"
4. Choose **Public** or **Private**
5. **DO NOT** check "Add a README file" (you already have files)
6. Click "Create repository"

### 6. Connect and Push to GitHub

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## What Gets Uploaded

✅ **Will be uploaded:**
- All source code files (`.tsx`, `.ts`, `.js`, `.css`, etc.)
- Configuration files (`package.json`, `next.config.js`, `tailwind.config.js`, etc.)
- `data/` folder (artworks.json, orders.json, etc.) - **Important for Railway**
- `public/artworks/` folder structure (even if empty)
- All component files
- All API routes
- README and documentation files

❌ **Will NOT be uploaded** (thanks to `.gitignore`):
- `node_modules/` folder (too large, will be installed on Railway)
- `.env.local` file (sensitive data - add to Railway environment variables)
- `.next/` build folder (generated during build)
- Any local cache files

## After Uploading

1. **Verify on GitHub**: Check that all your files appear on GitHub
2. **Deploy on Railway**: Follow the `DEPLOYMENT.md` guide
3. **Add Environment Variables**: Add Firebase config in Railway dashboard

## Important Notes

- Your `.gitignore` is already configured correctly
- The `data/` folder structure will be uploaded (empty files are fine)
- Railway will create the actual data files when your app runs
- Never commit `.env.local` - always use Railway's environment variables

## Troubleshooting

### If you get "repository not found" error:
- Check your GitHub username is correct
- Make sure you created the repository on GitHub first
- Verify you have access to the repository

### If files are missing:
- Check `.gitignore` - it might be excluding something important
- Run `git status` to see what's not being tracked
- Use `git add -f filename` to force add if needed

### If push is rejected:
- Make sure you're authenticated: `git config --global user.name "Your Name"`
- Check: `git config --global user.email "your.email@example.com"`

