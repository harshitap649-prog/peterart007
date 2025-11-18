# ✅ Render Deployment Checklist

## Your Code is Now on GitHub! ✅
- Repository: `harshitap649-prog/peterart007`
- Branch: `main`
- Latest commit: `c2d4d77`

## Next Steps to Deploy on Render:

### Step 1: Verify Render Service Connection

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/web/srv-d4aupufpm1nc739g61lg
   - Or go to: https://dashboard.render.com and find your `peterart007` service

2. **Check Service Settings:**
   - Click on your service: `peterart007`
   - Go to "Settings" tab
   - Verify:
     - ✅ Repository: `harshitap649-prog/peterart007`
     - ✅ Branch: `main`
     - ✅ Auto-Deploy: `Yes`
     - ✅ Build Command: `npm install && npm run build`
     - ✅ Start Command: `npm start`

### Step 2: Verify Environment Variables

Go to "Environment" tab and ensure these are set:

```
NODE_ENV = production
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDR-5Y6Hwak1g-UkpY5zqJw8w-2zOzsZPk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = peterart007-a4e67.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = peterart007-a4e67
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = peterart007-a4e67.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 640399338042
NEXT_PUBLIC_FIREBASE_APP_ID = 1:640399338042:web:57f2d8f9803a7e92346303
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-G9QJNP2J7X
```

### Step 3: Trigger Deployment

**Option A: Auto-Deploy (Recommended)**
- Since you just pushed to GitHub, Render should auto-deploy
- Go to "Events" tab to see the deployment progress
- Look for: "Deploy started for **c2d4d77**"

**Option B: Manual Deploy**
- If auto-deploy didn't trigger, click "Manual Deploy" button
- Select "Deploy latest commit"
- Click "Deploy"

### Step 4: Monitor Deployment

1. **Watch Build Logs:**
   - Go to "Logs" tab
   - Watch for build progress
   - Should see: `npm install`, `npm run build`, `npm start`
   - Build takes 5-10 minutes

2. **Check for Errors:**
   - If build fails, check logs for errors
   - Common issues:
     - Missing dependencies → Check package.json
     - Environment variables → Verify all are set
     - Build errors → Check Next.js build output

### Step 5: Verify Live Site

Once deployment completes:

1. **Check Service Status:**
   - Should show: "Live" (green)
   - URL: `https://peterart007.onrender.com`

2. **Test Your Site:**
   - Visit: https://peterart007.onrender.com
   - Test login/signup
   - Test artwork browsing
   - Test messaging features
   - Check if banner ads are showing

3. **Update Firebase:**
   - Go to: https://console.firebase.google.com
   - Select project: `peterart007-a4e67`
   - Go to: Authentication → Settings → Authorized domains
   - Add: `peterart007.onrender.com`
   - Click "Add"

### Step 6: Keep Service Awake (Free Tier)

**Option 1: UptimeRobot (Free)**
1. Sign up: https://uptimerobot.com
2. Add Monitor:
   - URL: `https://peterart007.onrender.com`
   - Type: HTTP(s)
   - Interval: 5 minutes
3. This will ping your site every 5 minutes to keep it awake

**Option 2: Upgrade to Paid**
- $7/month for always-on service
- No cold starts
- Better performance

## Troubleshooting

### Build Fails:
- Check "Logs" tab for error messages
- Verify all dependencies in package.json
- Check Node version (should be 18+)

### Site Not Loading:
- Check service status (should be "Live")
- Check "Logs" for runtime errors
- Verify environment variables are correct

### Firebase Errors:
- Verify authorized domains include `peterart007.onrender.com`
- Check Firebase console for API restrictions
- Verify all environment variables match Firebase config

## Your Live URL:
🌐 **https://peterart007.onrender.com**

## Quick Commands (if needed):

```bash
# Check git status
git status

# Push new changes
git add .
git commit -m "Your commit message"
git push origin main

# Render will auto-deploy on push!
```

---

**✅ Your code is pushed to GitHub!**
**✅ Render should auto-deploy now!**
**✅ Check the "Events" tab in Render dashboard to see deployment progress!**

