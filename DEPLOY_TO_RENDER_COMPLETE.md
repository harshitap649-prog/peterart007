# 🚀 Complete Guide: Deploy Your Site to Render via GitHub

## ✅ Step 1: Code is Now on GitHub!

Your code has been successfully pushed to GitHub:
- **Repository**: `https://github.com/harshitap649-prog/peterart007`
- **Branch**: `main`
- **Latest Commit**: All changes committed and pushed ✅

---

## 🎯 Step 2: Deploy on Render

### 2.1 Sign Up/Login to Render

1. Go to **https://render.com**
2. Click **"Get Started for Free"** or **"Sign In"**
3. **Sign up with your GitHub account** (recommended for easy integration)
   - This allows Render to automatically access your repositories

### 2.2 Create New Web Service

1. Once logged in, click the **"New +"** button (top right corner)
2. Select **"Web Service"**
3. If prompted, **connect your GitHub account** (if not already connected)
4. **Select your repository**: `harshitap649-prog/peterart007`
5. Click **"Connect"**

### 2.3 Configure Service Settings

Render will automatically detect your `render.yaml` file, but you can verify these settings:

**Basic Settings:**
- **Name**: `peterart007` (or your preferred name)
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (or choose closest to your users)
- **Branch**: `main`
- **Root Directory**: Leave empty (or `./`)

**Build & Deploy:**
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: `Yes` (automatically deploys on git push)

**Note**: If Render doesn't auto-detect from `render.yaml`, manually enter:
- Build Command: `npm install --legacy-peer-deps && npm run build`
- Start Command: `npm start`

### 2.4 Configure Environment Variables ⚠️ IMPORTANT

Click on **"Environment"** tab and add these Firebase environment variables:

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

**Important Instructions:**
1. Click **"Add Environment Variable"** for each variable
2. Enter the **Key** (exactly as shown, case-sensitive)
3. Enter the **Value** (exactly as shown)
4. Click **"Save Changes"** after adding all variables
5. **Double-check** all variable names start with `NEXT_PUBLIC_` (required for Next.js client-side access)

### 2.5 Create Web Service

1. Review all settings
2. Click **"Create Web Service"**
3. Render will automatically start building and deploying your application
4. This process takes **5-10 minutes** for the first deployment

---

## 📊 Step 3: Monitor Deployment

### 3.1 Watch Build Progress

1. Go to the **"Logs"** tab in your Render dashboard
2. You'll see the build process:
   - Installing dependencies (`npm install`)
   - Building Next.js app (`npm run build`)
   - Starting the server (`npm start`)
3. Wait for the build to complete (green checkmark ✅)

### 3.2 Check for Errors

If the build fails:
- Check the **"Logs"** tab for error messages
- Common issues:
  - **Missing dependencies**: Verify `package.json` has all required packages
  - **Environment variables**: Ensure all Firebase variables are set correctly
  - **Build errors**: Check for TypeScript or Next.js errors
  - **Node version**: Should be Node 18+ (configured in `render.yaml`)

---

## 🌐 Step 4: Configure Firebase for Production

### 4.1 Update Firebase Authorized Domains

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project: **`peterart007-a4e67`**
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Enter your Render domain: **`peterart007.onrender.com`** (or your actual Render URL)
6. Click **"Add"**

**This is CRITICAL** - Without this, Firebase authentication won't work on your live site!

### 4.2 Verify Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Verify all the configuration values match what you entered in Render:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

---

## ✅ Step 5: Verify Your Live Site

### 5.1 Check Service Status

1. In Render dashboard, your service should show: **"Live"** (green status)
2. Your site URL will be: **`https://peterart007.onrender.com`** (or your custom name)

### 5.2 Test Your Site

Visit your live URL and test:
- ✅ Home page loads
- ✅ User login/signup works
- ✅ Google OAuth login works
- ✅ Artwork browsing works
- ✅ Admin panel access (if applicable)
- ✅ All features function correctly

### 5.3 Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for any errors (especially Firebase-related)
4. If you see Firebase errors, verify:
   - Environment variables are set correctly in Render
   - Firebase authorized domains include your Render URL

---

## 🔄 Step 6: Auto-Deploy Setup

### 6.1 Automatic Deployments

Once configured, Render will automatically:
- ✅ Deploy new changes when you push to GitHub
- ✅ Rebuild on every commit to `main` branch
- ✅ Show deployment status in Render dashboard

### 6.2 Manual Deploy (if needed)

If auto-deploy doesn't trigger:
1. Go to Render dashboard
2. Click **"Manual Deploy"** button
3. Select **"Deploy latest commit"**
4. Click **"Deploy"**

---

## 💤 Step 7: Keep Service Awake (Free Tier)

Render's free tier automatically sleeps after 15 minutes of inactivity. The first request after sleep takes 30-60 seconds (cold start).

### Option 1: UptimeRobot (Free - Recommended)

1. Sign up at **https://uptimerobot.com** (free account)
2. Click **"Add New Monitor"**
3. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `peterart007`
   - **URL**: `https://peterart007.onrender.com`
   - **Monitoring Interval**: 5 minutes
4. Click **"Create Monitor"**
5. This will ping your site every 5 minutes to keep it awake

### Option 2: Upgrade to Paid Plan

- **Cost**: $7/month
- **Benefits**:
  - Service never sleeps
  - No cold starts
  - Better performance
  - More resources

---

## 🐛 Troubleshooting

### Build Fails

**Symptoms**: Build shows red X or fails in logs

**Solutions**:
1. Check **"Logs"** tab for specific error messages
2. Verify all dependencies are in `package.json`
3. Check Node version (should be 18+)
4. Look for TypeScript errors
5. Verify build command: `npm install --legacy-peer-deps && npm run build`

### Environment Variables Not Working

**Symptoms**: Firebase errors, app not connecting to Firebase

**Solutions**:
1. Verify all variables start with `NEXT_PUBLIC_` (required for Next.js)
2. Check variable names match exactly (case-sensitive)
3. Verify values are correct (no extra spaces)
4. Restart the service after adding variables
5. Go to **"Environment"** tab → Click **"Save Changes"**

### Firebase Authentication Errors

**Symptoms**: Login doesn't work, Firebase errors in console

**Solutions**:
1. Verify Firebase authorized domains include your Render URL
2. Check Firebase console for API restrictions
3. Verify all environment variables match Firebase config
4. Check browser console for specific error messages
5. Ensure Firebase project settings are correct

### Site Not Loading / 502 Bad Gateway

**Symptoms**: Site shows error or doesn't load

**Solutions**:
1. Check service status (should be "Live" in Render dashboard)
2. Check **"Logs"** tab for runtime errors
3. If service is sleeping (free tier), wait 30-60 seconds for cold start
4. Verify build completed successfully
5. Check if service is paused (unpause if needed)

### Slow First Load

**Symptoms**: First page load takes 30-60 seconds

**Solutions**:
- This is normal for free tier (cold start after sleep)
- Use UptimeRobot to keep service awake
- Or upgrade to paid plan for always-on service

---

## 📋 Quick Reference

### Your Live URL
🌐 **https://peterart007.onrender.com**

### GitHub Repository
🔗 **https://github.com/harshitap649-prog/peterart007**

### Render Dashboard
🔗 **https://dashboard.render.com**

### Firebase Console
🔗 **https://console.firebase.google.com**

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub ✅
- [ ] Render account created
- [ ] Web service created on Render
- [ ] Environment variables added (all 8 variables)
- [ ] Build completed successfully
- [ ] Service shows "Live" status
- [ ] Firebase authorized domains updated
- [ ] Site is accessible and working
- [ ] UptimeRobot monitor set up (optional but recommended)

---

## 📝 Future Updates

To update your live site:

1. Make changes to your code locally
2. Commit changes:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Render will automatically deploy the changes!
4. Monitor deployment in Render dashboard

---

## 🆘 Need Help?

If you encounter issues:
1. Check Render service logs
2. Check Render build logs
3. Verify environment variables are set correctly
4. Ensure Firebase is configured for production
5. Check GitHub repository is accessible
6. Review this guide's troubleshooting section

---

**🎊 Congratulations! Your site should now be live on Render!**

Visit: **https://peterart007.onrender.com**

