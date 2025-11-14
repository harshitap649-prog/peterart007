# Deploy to Render - Step by Step Guide

## ✅ Step 1: Code is Already on GitHub
Your code has been pushed to: `https://github.com/harshitap649-prog/peterart007.git`

## 🚀 Step 2: Deploy on Render

### 2.1 Sign Up/Login to Render
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account (recommended for easy integration)

### 2.2 Create New Web Service
1. Once logged in, click the **"New +"** button (top right)
2. Select **"Web Service"**
3. If prompted, connect your GitHub account
4. Select your repository: **`harshitap649-prog/peterart007`**

### 2.3 Configure Service Settings

**Basic Settings:**
- **Name**: `peterart007` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users (e.g., `Oregon (US West)` or `Singapore`)
- **Branch**: `main`
- **Root Directory**: Leave empty (or `./` if needed)

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 2.4 Configure Environment Variables

Click on **"Advanced"** → **"Environment Variables"** and add these:

```
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDR-5Y6Hwak1g-UkpY5zqJw8w-2zOzsZPk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=peterart007-a4e67.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=peterart007-a4e67
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=peterart007-a4e67.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=640399338042
NEXT_PUBLIC_FIREBASE_APP_ID=1:640399338042:web:57f2d8f9803a7e92346303
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G9QJNP2J7X
```

**Important:** 
- Click "Add" after each variable
- Make sure variable names match exactly (case-sensitive)
- All Firebase variables must start with `NEXT_PUBLIC_`

### 2.5 Advanced Settings (Optional)
- **Auto-Deploy**: `Yes` (deploys automatically on git push)
- **Health Check Path**: `/` (or leave default)

### 2.6 Deploy
1. Click **"Create Web Service"**
2. Render will automatically start building and deploying
3. Wait for the build to complete (usually 5-10 minutes)
4. Your site will be live at: `https://peterart007.onrender.com` (or your custom name)

## 🔥 Step 3: Configure Firebase for Production

### 3.1 Update Firebase Authorized Domains
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `peterart007-a4e67`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Render domain: `peterart007.onrender.com` (or your actual Render URL)
6. Click **"Add"**

### 3.2 Update API Key Restrictions (Optional but Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `peterart007-a4e67`
3. Go to **APIs & Services** → **Credentials**
4. Find your API key and click to edit
5. Under **"Application restrictions"** → Select **"HTTP referrers (web sites)"**
6. Click **"Add an item"** and add:
   - `https://peterart007.onrender.com/*`
   - `https://*.onrender.com/*` (if you want to allow all Render subdomains)
7. Click **"Save"**

## 🌐 Step 4: Custom Domain (Optional)

If you have a custom domain:

1. **In Render Dashboard:**
   - Go to your service
   - Click **"Custom Domains"**
   - Click **"Add Custom Domain"**
   - Enter your domain name
   - Follow the DNS configuration instructions

2. **Update Firebase:**
   - Add your custom domain to Firebase Authorized domains

## 📋 Quick Checklist

- [ ] Code pushed to GitHub ✅
- [ ] Render account created
- [ ] Web service created on Render
- [ ] Environment variables added
- [ ] Build completed successfully
- [ ] Firebase authorized domains updated
- [ ] Site is accessible

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version (should be 18+)
- Check for TypeScript errors

### Environment Variables Not Working
- Make sure all variables start with `NEXT_PUBLIC_` for client-side access
- Restart the service after adding variables
- Check variable names match exactly (case-sensitive)
- Verify values are correct (no extra spaces)

### Firebase Errors
- Verify Firebase config values are correct in Render environment variables
- Check Firebase console for API restrictions
- Ensure authorized domains include your Render URL
- Check browser console for specific error messages

### Site Not Loading
- Check service logs in Render dashboard
- Verify build completed successfully
- Check if service is running (not paused)
- Wait a few minutes after first deployment

### 502 Bad Gateway
- Service might be sleeping (free tier)
- Wait 30-60 seconds for cold start
- Consider upgrading to paid plan to avoid sleep

## 💰 Free Tier Limitations

Render's free tier includes:
- ✅ 750 hours/month of runtime
- ⚠️ Automatic sleep after 15 minutes of inactivity
- ⚠️ First request after sleep may take 30-60 seconds (cold start)

**To avoid sleep:**
- Upgrade to paid plan ($7/month)
- Use a service like [UptimeRobot](https://uptimerobot.com) to ping your site every 5 minutes

## 🔄 Auto-Deploy

Once configured, Render will automatically:
- Deploy new changes when you push to GitHub
- Rebuild on every commit to `main` branch
- Show deployment status in Render dashboard

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Check Render build logs
3. Verify environment variables are set correctly
4. Ensure Firebase is configured for production
5. Check GitHub repository is accessible

---

**Your site will be live at:** `https://peterart007.onrender.com` (or your custom domain)

Good luck with your deployment! 🚀

