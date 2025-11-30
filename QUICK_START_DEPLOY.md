# ⚡ Quick Start - Deploy in 5 Minutes

## ✅ Step 1: Push to GitHub (2 minutes)

### Option A: Use PowerShell Script (Easiest)
1. Open PowerShell in your project folder
2. Run:
```powershell
.\deploy-to-github.ps1
```

### Option B: Manual Commands
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## ✅ Step 2: Deploy on Render (3 minutes)

### 2.1 Create Account
1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. **Sign up with GitHub** (one-click)

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub** → Select `peterart007` repository
3. Click **"Connect"**

### 2.3 Settings (Auto-detected from render.yaml)
- ✅ Name: `peterart007`
- ✅ Build: `npm install --legacy-peer-deps && npm run build`
- ✅ Start: `npm start`
- ✅ Auto-Deploy: `Yes`

### 2.4 Add Environment Variables ⚠️

Click **"Environment"** tab, add these **7 variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDR-5Y6Hwak1g-UkpY5zqJw8w-2zOzsZPk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=peterart007-a4e67.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=peterart007-a4e67
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=peterart007-a4e67.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=640399338042
NEXT_PUBLIC_FIREBASE_APP_ID=1:640399338042:web:57f2d8f9803a7e92346303
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G9QJNP2J7X
```

**Important:** Click "Add Environment Variable" for each one!

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes
3. Your site will be live at: **`https://peterart007.onrender.com`**

---

## ✅ Step 3: Configure Firebase (1 minute)

1. Go to **https://console.firebase.google.com**
2. Select project: **peterart007-a4e67**
3. **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Enter: **`peterart007.onrender.com`**
6. Click **"Add"**

**⚠️ This is REQUIRED for login to work!**

---

## ✅ Step 4: Keep Site Awake (Optional but Recommended)

1. Sign up: **https://uptimerobot.com** (free)
2. Add monitor:
   - Type: **HTTP(s)**
   - URL: **`https://peterart007.onrender.com`**
   - Interval: **5 minutes**
3. This keeps your site awake (free tier sleeps after 15 min)

---

## 🎉 Done!

Your site is now live at: **https://peterart007.onrender.com**

---

## 🔄 Update Your Site Later

Just push to GitHub:
```bash
git add .
git commit -m "Your update"
git push origin main
```

Render will auto-deploy! 🚀

---

## 🐛 Problems?

- **Build fails?** Check "Logs" tab in Render
- **Firebase errors?** Verify authorized domains
- **Site not loading?** Wait 30-60 sec (cold start on free tier)

See `DEPLOY_NOW.md` for detailed troubleshooting.

