# 🚀 Deploy to Render - Step by Step Guide

## Quick Deployment Steps

### Step 1: Prepare Your Code for GitHub

1. **Make sure all changes are committed:**
```bash
git add .
git commit -m "Prepare for Render deployment"
```

2. **Check if you have a remote repository:**
```bash
git remote -v
```

If you don't have a remote, create one on GitHub and add it:
```bash
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Login with your GitHub account

2. **Create New Web Service (if not already created):**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository: `peterart007`
   - Click "Connect"

3. **Configure Service Settings:**
   ```
   Name: peterart007
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables:**
   Click "Add Environment Variable" and add these (get values from firebase.config.js):
   ```
   NODE_ENV = production
   NEXT_PUBLIC_FIREBASE_API_KEY = (your Firebase API key)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = (your Firebase auth domain)
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = (your Firebase project ID)
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = (your Firebase storage bucket)
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (your messaging sender ID)
   NEXT_PUBLIC_FIREBASE_APP_ID = (your Firebase app ID)
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = (your measurement ID)
   ```

5. **Advanced Settings:**
   - Auto-Deploy: Yes
   - Health Check Path: /
   - Instance Type: Free (or upgrade for better performance)

6. **Click "Create Web Service"**
   - Render will start building your app
   - Wait 5-10 minutes for the build to complete
   - Your site will be live at: `https://peterart007.onrender.com`

### Step 3: Update Firebase Settings

1. **Add Render Domain to Firebase:**
   - Go to: https://console.firebase.google.com
   - Select your project
   - Go to: Authentication → Settings → Authorized domains
   - Click "Add domain"
   - Add: `peterart007.onrender.com`
   - Click "Add"

2. **Update Firestore Rules (if needed):**
   - Go to: Firestore Database → Rules
   - Make sure rules allow your Render domain

### Step 4: Verify Deployment

1. **Check Build Logs:**
   - In Render dashboard, go to "Logs" tab
   - Check for any errors

2. **Test Your Site:**
   - Visit: `https://peterart007.onrender.com`
   - Test login, signup, and main features
   - Check if ads are loading

3. **Monitor Service:**
   - Check "Metrics" tab for performance
   - Check "Events" tab for deployment history

## Important Notes

### Free Tier Limitations:
- ⚠️ Service sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds (cold start)
- ✅ 750 hours/month free runtime

### To Keep Service Always Awake:
1. **Option 1:** Upgrade to paid plan ($7/month)
2. **Option 2:** Use UptimeRobot (free) to ping your site every 5 minutes
   - Sign up at: https://uptimerobot.com
   - Add monitor for: `https://peterart007.onrender.com`
   - Set interval to 5 minutes

### Auto-Deploy:
- ✅ Every push to `main` branch will auto-deploy
- ✅ No manual deployment needed
- ✅ Check "Events" tab to see deployment status

## Troubleshooting

### Build Fails:
1. Check build logs in Render dashboard
2. Verify all dependencies in package.json
3. Check Node version (should be 18+)

### Site Not Loading:
1. Check service status (should be "Live")
2. Check logs for errors
3. Verify environment variables are set

### Firebase Errors:
1. Verify Firebase config in environment variables
2. Check authorized domains in Firebase console
3. Verify API keys are correct

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Update any hardcoded localhost URLs
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring/uptime service
5. ✅ Share your live URL!

Your site will be live at: **https://peterart007.onrender.com**

