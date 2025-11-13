# Firebase API Key Troubleshooting Guide

## Error: "auth/api-key-not-valid"

This error means Firebase cannot validate your API key. Follow these steps:

## Step 1: Verify API Key in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **peterart007-a4e67**
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Find your **Web app** (or create one if it doesn't exist)
6. Copy the **API Key** from the config

## Step 2: Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **peterart007-a4e67**
3. Go to **APIs & Services** → **Credentials**
4. Find your API key (starts with `AIza...`)
5. Click on it to edit
6. Check **"API restrictions"**:
   - If restricted, make sure **"Firebase Authentication API"** is enabled
   - Or set to **"Don't restrict key"** for testing
7. Check **"Application restrictions"**:
   - Set to **"None"** for localhost testing
   - Or add `localhost:3000` to HTTP referrers

## Step 3: Update .env.local File

Make sure your `.env.local` file has the correct API key:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDR-5Y6Hwak1g-UkpY5zqJw8w-2z0zsZPk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=peterart007-a4e67.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=peterart007-a4e67
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=peterart007-a4e67.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=640399338042
NEXT_PUBLIC_FIREBASE_APP_ID=1:640399338042:web:57f2d8f9803a7e92346303
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G9QJNP2J7X
```

## Step 4: Restart Next.js Server

**IMPORTANT**: After updating `.env.local`, you MUST restart the dev server:

1. Stop the server (Ctrl+C)
2. Run: `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh the page (Ctrl+F5)

## Step 5: Enable Required APIs

Make sure these APIs are enabled in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **peterart007-a4e67**
3. Go to **APIs & Services** → **Library**
4. Enable these APIs:
   - **Identity Toolkit API** (for Authentication)
   - **Cloud Firestore API**
   - **Cloud Storage API**

## Step 6: Verify Firebase Services

In Firebase Console, make sure these are enabled:

1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (if using Google login)

2. **Firestore Database**:
   - Go to Firestore Database
   - Create database if not exists

3. **Storage**:
   - Go to Storage
   - Get started if not initialized

## Still Not Working?

If the error persists:

1. **Get a fresh API key**:
   - In Firebase Console → Project Settings
   - Delete the old web app
   - Add a new web app
   - Copy the new config

2. **Check browser console** for detailed error messages

3. **Verify the API key format**:
   - Should start with `AIza`
   - Should be about 39 characters long
   - No spaces or special characters

4. **Test with a simple Firebase connection**:
   - Check browser console for "Firebase initialized successfully" message

