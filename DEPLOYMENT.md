# Deployment Guide - Railway

## Prerequisites
1. GitHub account
2. Railway account (sign up at https://railway.app)
3. Your code pushed to GitHub

## Step 1: Push Code to GitHub

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it `peterart007` (or your preferred name)
   - Don't initialize with README
   - Click "Create repository"

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Railway

1. **Sign up/Login to Railway**
   - Go to https://railway.app
   - Sign up with GitHub (recommended for easy integration)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `peterart007` repository

3. **Configure Environment Variables**
   - Railway will detect it's a Next.js app
   - Go to "Variables" tab
   - Add your Firebase environment variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```

4. **Configure Build Settings**
   - Railway auto-detects Next.js
   - Build command: `npm run build` (auto-detected)
   - Start command: `npm start` (auto-detected)
   - Node version: 18.x or 20.x (set in package.json or Railway settings)

5. **Deploy**
   - Railway will automatically start building and deploying
   - Wait for deployment to complete (usually 2-5 minutes)
   - Your site will be live at a Railway-provided URL (e.g., `peterart007.up.railway.app`)

## Step 3: Custom Domain (Optional)

1. Go to your project settings
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Railway's DNS instructions

## Important Notes

### File Persistence
- Railway provides persistent storage, so your `data/` and `public/artworks/` files will persist
- Files are stored in the container's filesystem
- **Backup Recommendation**: Consider setting up periodic backups of your data directory

### Environment Variables
- Never commit `.env.local` to GitHub
- All sensitive data should be in Railway's environment variables
- Railway automatically injects these at build/runtime

### Build Optimization
- Railway will run `npm run build` automatically
- The build process creates an optimized production version
- Static assets are served efficiently

## Troubleshooting

### Build Fails
- Check Railway logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Files Not Persisting
- Railway uses persistent storage, but ensure you're writing to the correct paths
- Check file permissions in your API routes

### Environment Variables Not Working
- Verify variables are set in Railway dashboard
- Restart deployment after adding new variables
- Check variable names match exactly (case-sensitive)

## Monitoring

- Railway provides logs in real-time
- Monitor usage in the dashboard
- Set up alerts for deployment failures

## Cost

- Railway offers a free tier with $5 credit monthly
- After free tier, pay-as-you-go pricing
- Check current pricing at https://railway.app/pricing

