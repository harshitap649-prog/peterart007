# 🚀 Complete Deployment Guide - GitHub & Render

## Prerequisites
- ✅ GitHub account
- ✅ Render account (sign up at https://render.com)
- ✅ Firebase project configured

---

## Step 1: Prepare Your Code for GitHub

### 1.1 Check Current Status
```bash
git status
```

### 1.2 Add All Changes
```bash
git add .
```

### 1.3 Commit Changes
```bash
git commit -m "Prepare for deployment: Updated artwork upload/edit functionality and improved UI"
```

### 1.4 Push to GitHub
```bash
git push origin main
```

If you haven't set up the remote yet:
```bash
# Check if remote exists
git remote -v

# If no remote, add it (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/peterart007.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on Render

### 2.1 Sign Up/Login to Render
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (recommended for easy integration)

### 2.2 Create New Web Service

**Option A: Using render.yaml (Recommended)**
1. Once logged in, click **"New +"** button (top right)
2. Select **"Blueprint"**
3. Connect your GitHub repository: `peterart007`
4. Render will automatically detect `render.yaml` and configure everything
5. Click **"Apply"**

**Option B: Manual Setup**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select repository: `peterart007`
4. Click **"Connect"**

### 2.3 Configure Service Settings (If Manual Setup)

**Basic Settings:**
- **Name**: `peterart007`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` or closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys automatically on git push)
- **Health Check Path**: `/`
- **Instance Type**: `Free` (or upgrade for better performance)

### 2.4 Configure Environment Variables

Go to **"Environment"** tab and add these variables:

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

**Important Notes:**
- Click **"Add"** after each variable
- Variable names are **case-sensitive**
- All Firebase variables must start with `NEXT_PUBLIC_`
- Replace the values above with your actual Firebase config if different

### 2.5 Deploy

1. Click **"Create Web Service"** (or **"Apply"** if using Blueprint)
2. Render will automatically start building and deploying
3. Monitor the build logs in the **"Logs"** tab
4. Build typically takes 5-10 minutes

---

## Step 3: Monitor Deployment

### 3.1 Watch Build Logs
- Go to **"Logs"** tab in Render dashboard
- You should see:
  ```
  npm install
  npm run build
  npm start
  ```

### 3.2 Check for Errors
Common issues and solutions:

**Build Fails:**
- Check Node version (should be 18+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

**Environment Variables Missing:**
- Go to **"Environment"** tab
- Verify all `NEXT_PUBLIC_*` variables are set
- Make sure there are no typos

**Firebase Connection Issues:**
- Verify Firebase config values
- Check Firebase project settings
- Ensure Firebase services are enabled

### 3.3 Verify Deployment
Once deployment is successful:
- Your app will be available at: `https://peterart007.onrender.com`
- Or your custom domain if configured
- Test all functionality:
  - ✅ User authentication
  - ✅ Artwork upload/edit
  - ✅ Cart and checkout
  - ✅ Admin dashboard

---

## Step 4: Post-Deployment Checklist

### 4.1 Test Core Features
- [ ] User registration and login
- [ ] Artwork browsing and search
- [ ] Artwork upload (artist dashboard)
- [ ] Artwork editing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Admin dashboard access

### 4.2 Verify Data Persistence
- [ ] Artworks are saved correctly
- [ ] Orders are created properly
- [ ] User data persists
- [ ] Images upload successfully

### 4.3 Performance Check
- [ ] Page load times are acceptable
- [ ] Images load correctly
- [ ] Mobile responsiveness works
- [ ] No console errors

---

## Step 5: Custom Domain (Optional)

1. Go to your service settings in Render
2. Click **"Custom Domains"**
3. Add your domain
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

---

## Troubleshooting

### Build Fails
```bash
# Check package.json for correct Node version
# Verify all dependencies are listed
# Check for TypeScript errors
npm run build
```

### Environment Variables Not Working
- Make sure all variables start with `NEXT_PUBLIC_` for client-side access
- Restart the service after adding variables
- Check for typos in variable names

### Firebase Errors
- Verify Firebase config in `firebase.config.js`
- Check Firebase Console for service status
- Ensure Firebase services are enabled:
  - Authentication
  - Firestore Database
  - Storage

### Images Not Loading
- Check Firebase Storage rules
- Verify image URLs are correct
- Check CORS settings if using external image sources

---

## Quick Commands Reference

```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Check remote repository
git remote -v

# View build logs (in Render dashboard)
# Go to Logs tab
```

---

## Support

If you encounter issues:
1. Check Render logs for error messages
2. Verify all environment variables are set
3. Test locally with `npm run build` and `npm start`
4. Check Firebase Console for service status
5. Review this guide for common solutions

---

## Success! 🎉

Once deployed, your site will be live at:
**https://peterart007.onrender.com**

(Or your custom domain if configured)

Happy deploying! 🚀

