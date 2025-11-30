# 🚀 Quick Deploy Guide - GitHub & Render

## ✅ Step 1: Code Pushed to GitHub

Your latest changes have been committed and pushed to GitHub:
- ✅ All changes committed
- ✅ Pushed to `main` branch
- ✅ Ready for deployment

---

## 🎯 Step 2: Deploy on Render

### 2.1 Go to Render Dashboard

1. Visit: **https://dashboard.render.com**
2. Sign in (or create account with GitHub)

### 2.2 Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect GitHub account (if not already connected)
4. Select repository: **`harshitap649-prog/peterart007`**
5. Click **"Connect"**

### 2.3 Configure Settings

**Basic Settings:**
- **Name**: `peterart007`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty

**Build & Deploy:**
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: `Yes` ✅

### 2.4 Add Environment Variables ⚠️ CRITICAL

Click **"Environment"** tab and add these (one by one):

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

**Important:**
- Click **"Add Environment Variable"** for each
- Enter Key and Value exactly as shown
- All keys must start with `NEXT_PUBLIC_`
- Click **"Save Changes"** after adding all

### 2.5 Create Service

1. Review all settings
2. Click **"Create Web Service"**
3. Wait 5-10 minutes for first build

---

## 🔥 Step 3: Configure Firebase

### 3.1 Add Render Domain to Firebase

1. Go to: **https://console.firebase.google.com**
2. Select project: **`peterart007-a4e67`**
3. Go to: **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Enter: **`peterart007.onrender.com`** (or your actual Render URL)
6. Click **"Add"**

**⚠️ This is REQUIRED** - Without this, login won't work!

---

## 📊 Step 4: Monitor Deployment

1. Go to **"Logs"** tab in Render
2. Watch the build process:
   - Installing dependencies
   - Building Next.js app
   - Starting server
3. Wait for ✅ green checkmark

---

## ✅ Step 5: Verify Live Site

1. Your site URL: **`https://peterart007.onrender.com`**
2. Test:
   - ✅ Home page loads
   - ✅ Login works
   - ✅ All features work

---

## 💤 Step 6: Keep Service Awake (Free Tier)

Render free tier sleeps after 15 min inactivity.

### Use UptimeRobot (Free):

1. Sign up: **https://uptimerobot.com**
2. Click **"Add New Monitor"**
3. Configure:
   - **Type**: HTTP(s)
   - **URL**: `https://peterart007.onrender.com`
   - **Interval**: 5 minutes
4. Click **"Create Monitor"**

This pings your site every 5 min to keep it awake!

---

## 🐛 Troubleshooting

### Build Fails
- Check **"Logs"** tab for errors
- Verify all environment variables are set
- Check Node version (should be 18+)

### Firebase Errors
- Verify authorized domains include Render URL
- Check all environment variables match Firebase config
- Ensure variables start with `NEXT_PUBLIC_`

### Site Not Loading
- Check service status (should be "Live")
- Wait 30-60 seconds if service was sleeping
- Check logs for runtime errors

---

## 📋 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repo**: https://github.com/harshitap649-prog/peterart007
- **Firebase Console**: https://console.firebase.google.com
- **UptimeRobot**: https://uptimerobot.com

---

## 🎉 Success!

Once deployed, your site will be live at:
**https://peterart007.onrender.com**

---

## 🔄 Future Updates

To update your live site:
1. Make changes locally
2. Run:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Render auto-deploys! 🚀

---

**Need help? Check the full guide: `DEPLOY_TO_RENDER_COMPLETE.md`**
