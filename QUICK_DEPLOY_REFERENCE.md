# 🚀 Quick Deploy Reference Card

## ✅ Current Status

- **GitHub Repository**: ✅ Pushed to `harshitap649-prog/peterart007`
- **Latest Commit**: All changes committed and pushed
- **Render Config**: ✅ `render.yaml` is configured

## 🎯 Next Steps (5 Minutes)

### 1. Go to Render
👉 **https://render.com** → Sign in with GitHub

### 2. Create Web Service
- Click **"New +"** → **"Web Service"**
- Select repo: `harshitap649-prog/peterart007`
- Click **"Create Web Service"**

### 3. Add Environment Variables
Go to **"Environment"** tab and add these 8 variables:

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

### 4. Update Firebase
- Go to **Firebase Console** → Your project
- **Authentication** → **Settings** → **Authorized domains**
- Add: `peterart007.onrender.com`

### 5. Wait for Build
- Watch **"Logs"** tab
- Build takes 5-10 minutes
- Status will show **"Live"** when done

## 🌐 Your Live URL
**https://peterart007.onrender.com**

## 📚 Full Guide
See `DEPLOY_TO_RENDER_COMPLETE.md` for detailed instructions.

## 🔄 Future Updates
```bash
git add .
git commit -m "Your message"
git push origin main
```
Render will auto-deploy! 🎉

