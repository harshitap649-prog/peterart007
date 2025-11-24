# ⚡ Quick Deploy to GitHub & Render

## 🎯 Quick Steps (5 minutes)

### Step 1: Commit & Push to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Deploy: Updated artwork functionality and UI"

# Push to GitHub
git push origin main
```

**If you don't have a remote yet:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Blueprint"**
4. **Connect** your `peterart007` repository
5. **Click "Apply"** (render.yaml will auto-configure)
6. **Add Environment Variables** (see below)
7. **Deploy!**

### Step 3: Add Environment Variables

In Render dashboard → Your Service → Environment tab, add:

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

### Step 4: Wait for Deployment

- Build takes 5-10 minutes
- Watch logs in Render dashboard
- Your site will be live at: `https://peterart007.onrender.com`

---

## ✅ That's It!

Your site is now live! 🎉

For detailed instructions, see **DEPLOYMENT_GUIDE.md**

