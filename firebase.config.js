import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Use environment variables if available, otherwise use hardcoded values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDR-5Y6Hwak1g-UkpY5zqJw8w-2zOzsZPk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "peterart007-a4e67.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "peterart007-a4e67",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "peterart007-a4e67.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "640399338042",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:640399338042:web:57f2d8f9803a7e92346303",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-G9QJNP2J7X"
};

// Validate Firebase config
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
  console.error('Firebase API key is missing or invalid. Please check your .env.local file.');
  console.error('Current API Key:', firebaseConfig.apiKey ? 'Set' : 'Missing');
}

// Initialize Firebase (only if not already initialized)
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Firebase Config:', {
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });
    throw error;
  }
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();


// Initialize Analytics (only on client side)
if (typeof window !== 'undefined') {
  try {
    getAnalytics(app);
  } catch (error) {
    // Analytics might fail if already initialized or in development
    console.warn('Analytics initialization warning:', error);
  }
}

