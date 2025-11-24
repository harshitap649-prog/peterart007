# 🚀 Automatic Deployment - Instructions

## ✅ What I've Prepared

I've created all the necessary files for deployment:

1. ✅ **render.yaml** - Updated with proper Render configuration
2. ✅ **DEPLOY_NOW.md** - Complete step-by-step guide
3. ✅ **DEPLOYMENT_GUIDE.md** - Detailed deployment documentation
4. ✅ **QUICK_DEPLOY.md** - Quick reference
5. ✅ **RUN_THIS.bat** - Simple script to push to GitHub

## 🎯 Quick Deploy (2 Options)

### Option 1: Run the Batch File (Easiest)

**Double-click `RUN_THIS.bat`** in your project folder. It will:
- Add all changes
- Commit with a message
- Push to GitHub automatically

### Option 2: Manual Commands

Open PowerShell or Command Prompt in your project folder and run:

```bash
git add .
git commit -m "Deploy: Updated artwork upload/edit functionality, improved UI, and deployment configuration"
git push origin main
```

## 📍 Your GitHub Repository

Your code is configured to push to:
**https://github.com/harshitap649-prog/peterart007.git**

## 🌐 Next: Deploy on Render

After pushing to GitHub:

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Blueprint"**
4. **Select repository**: `harshitap649-prog/peterart007`
5. **Click "Apply"** (render.yaml will auto-configure)
6. **Add Environment Variables** (see DEPLOY_NOW.md)
7. **Deploy!**

## 🔐 Required Environment Variables

Add these in Render → Environment tab:

```
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDR-5Y6Hwak1g-UkpY5zqJw8w-2zOzsZPk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=peterart007-a4e67.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=peterart007-a4e67
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=peterart007-a4e67.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=640399338042
NEXT_PUBLIC_FIREBASE_APP_ID=1:640399338042:web:57f2d8f9803a7e92346303
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G9QJNP2J7X
```

## ✅ That's It!

Your site will be live at: **https://peterart007.onrender.com**

For detailed instructions, see **DEPLOY_NOW.md**

