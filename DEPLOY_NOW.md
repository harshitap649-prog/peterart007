# 🚀 Quick Deployment Guide - GitHub + Render

## Step 1: Push Code to GitHub (If Not Already Done)

### 1.1 Initialize Git (if needed)
```bash
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 1.2 Create GitHub Repository
1. Go to **https://github.com/new**
2. Repository name: `peterart007`
3. Set to **Public** (or Private if you prefer)
4. **Don't** initialize with README
5. Click **"Create repository"**

### 1.3 Push Code to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

---

## Step 2: Deploy on Render

### 2.1 Sign Up/Login to Render
1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. **Sign up with GitHub** (recommended - one-click setup)

### 2.2 Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. **Connect GitHub** (if not already connected)
4. **Select repository**: `YOUR_USERNAME/peterart007`
5. Click **"Connect"**

### 2.3 Configure Service
Render will auto-detect settings from `render.yaml`, but verify:

- **Name**: `peterart007`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: `Yes`

### 2.4 Add Environment Variables ⚠️ CRITICAL

Click **"Environment"** tab and add these **EXACTLY**:

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
- Copy **EXACTLY** as shown (case-sensitive)
- All must start with `NEXT_PUBLIC_`
- Click **"Save Changes"** after adding all

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first build
3. Watch progress in **"Logs"** tab

---

## Step 3: Configure Firebase for Production

### 3.1 Add Render Domain to Firebase
1. Go to **https://console.firebase.google.com**
2. Select project: **peterart007-a4e67**
3. Go to: **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Enter: **`peterart007.onrender.com`** (or your actual Render URL)
6. Click **"Add"**

**⚠️ This is REQUIRED - Firebase auth won't work without this!**

---

## Step 4: Verify Deployment

### 4.1 Check Status
- Render dashboard should show **"Live"** (green)
- Your URL: **`https://peterart007.onrender.com`**

### 4.2 Test Your Site
- ✅ Home page loads
- ✅ Login/Signup works
- ✅ Google OAuth works
- ✅ All features function

---

## Step 5: Keep Service Awake (Free Tier)

Render free tier sleeps after 15 min inactivity.

### Use UptimeRobot (Free)
1. Sign up: **https://uptimerobot.com**
2. Click **"Add New Monitor"**
3. Configure:
   - Type: **HTTP(s)**
   - URL: **`https://peterart007.onrender.com`**
   - Interval: **5 minutes**
4. Click **"Create Monitor"**

This pings your site every 5 min to keep it awake.

---

## 🐛 Troubleshooting

### Build Fails
- Check **"Logs"** tab for errors
- Verify all env variables are set
- Check Node version (should be 18+)

### Firebase Errors
- Verify authorized domains include Render URL
- Check all env variables match Firebase config
- Ensure variables start with `NEXT_PUBLIC_`

### Site Not Loading
- Check service status (should be "Live")
- Wait 30-60 sec if service was sleeping
- Check logs for runtime errors

---

## ✅ Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created
- [ ] All 8 environment variables added
- [ ] Build completed successfully
- [ ] Firebase authorized domains updated
- [ ] Site is live and working
- [ ] UptimeRobot monitor set up (optional)

---

## 🔄 Future Updates

To update your live site:
```bash
git add .
git commit -m "Update description"
git push origin main
```

Render will automatically deploy! 🎉

---

## 📞 Your URLs

- **Live Site**: `https://peterart007.onrender.com`
- **GitHub**: `https://github.com/YOUR_USERNAME/peterart007`
- **Render Dashboard**: `https://dashboard.render.com`
- **Firebase Console**: `https://console.firebase.google.com`

---

**🎊 That's it! Your site is now live!**
