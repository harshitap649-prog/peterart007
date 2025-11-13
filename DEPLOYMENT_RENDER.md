# Deployment Guide - Render

## Prerequisites
1. GitHub account
2. Render account (sign up at https://render.com)
3. Your code pushed to GitHub

## Step 1: Push Code to GitHub

1. **Initialize git (if not already done):**
```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it `peterart007` (or your preferred name)
   - Don't initialize with README
   - Click "Create repository"

3. **Push your code:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Render

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up with GitHub (recommended for easy integration)

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub account if not already connected
   - Select your `peterart007` repository

3. **Configure Service Settings**
   - **Name**: `peterart007` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `./` if needed)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Configure Environment Variables**
   - Scroll down to "Environment Variables" section
   - Click "Add Environment Variable"
   - Add each Firebase variable:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDR-5Y6Hwak1g-UkpY5zqJw8w-2zOzsZPk
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=peterart007-a4e67.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=peterart007-a4e67
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=peterart007-a4e67.firebasestorage.app
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=640399338042
     NEXT_PUBLIC_FIREBASE_APP_ID=1:640399338042:web:57f2d8f9803a7e92346303
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G9QJNP2J7X
     ```
   - **Important**: Replace with your actual Firebase config values if different

5. **Configure Advanced Settings (Optional)**
   - **Auto-Deploy**: `Yes` (deploys automatically on git push)
   - **Health Check Path**: `/` (or leave default)
   - **Docker**: Not needed for Next.js

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically start building and deploying
   - Wait for the build to complete (usually 5-10 minutes)
   - Your site will be live at: `https://peterart007.onrender.com` (or your custom domain)

## Step 3: Configure Firebase for Production

1. **Update Firebase Authorized Domains**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project: `peterart007-a4e67`
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Add your Render domain: `peterart007.onrender.com` (or your custom domain)

2. **Update API Key Restrictions (if applicable)**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select project: `peterart007-a4e67`
   - Go to **APIs & Services** → **Credentials**
   - Find your API key and click to edit
   - Under "Application restrictions" → "HTTP referrers"
   - Add your Render domain: `https://peterart007.onrender.com/*`

## Step 4: Custom Domain (Optional)

1. **In Render Dashboard:**
   - Go to your service
   - Click "Custom Domains"
   - Click "Add Custom Domain"
   - Enter your domain name
   - Follow the DNS configuration instructions

2. **Update Firebase Authorized Domains:**
   - Add your custom domain to Firebase Authorized domains

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version (should be 18+)

### Environment Variables Not Working
- Make sure all variables start with `NEXT_PUBLIC_` for client-side access
- Restart the service after adding variables
- Check variable names match exactly (case-sensitive)

### Firebase Errors
- Verify Firebase config values are correct
- Check Firebase console for API restrictions
- Ensure authorized domains include your Render URL

### Site Not Loading
- Check service logs in Render dashboard
- Verify build completed successfully
- Check if service is running (not paused)

## Free Tier Limitations

Render's free tier includes:
- 750 hours/month of runtime
- Automatic sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds (cold start)

To avoid sleep:
- Upgrade to paid plan ($7/month)
- Use a service like UptimeRobot to ping your site every 5 minutes

## Support

If you encounter issues:
1. Check Render service logs
2. Check Render build logs
3. Verify environment variables are set correctly
4. Ensure Firebase is configured for production

