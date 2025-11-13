# Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (add your OAuth consent screen)
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see README.md)
5. Enable Storage:
   - Go to Storage
   - Get started
   - Set up security rules (see README.md)
6. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Click the web icon (</>)
   - Copy the config values

## 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 4. Add Logo

Copy your logo image (`logoo.png`) from `Downloads` folder to `public` folder:
- Source: `Downloads\logoo.png`
- Destination: `public\logoo.png`

## 5. Create Admin User

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter email: `admin@peterart.com` (or your preferred admin email)
4. Set a password
5. Update `lib/auth.js` if you used a different admin email

## 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 7. Test the Application

1. **Sign In**: Use the admin credentials or Google OAuth
2. **Admin Panel**: 
   - Add artworks with 2-3 images
   - View orders and users
   - Manage order statuses
3. **User Panel**:
   - Browse artworks
   - Search, like, comment, share
   - Add to wishlist
   - Place orders

## Troubleshooting

- **Logo not showing**: Make sure `logoo.png` is in the `public` folder
- **Firebase errors**: Check your `.env.local` file has correct values
- **Authentication errors**: Make sure Email/Password and Google are enabled in Firebase
- **Image upload fails**: Check Storage rules in Firebase Console

