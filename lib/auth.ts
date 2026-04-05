import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase.config';

// Admin emails - add admin emails here
export const ADMIN_EMAILS = ['peterchoudhary8963@gmail.com'];

// Admin password for the admin email
export const ADMIN_PASSWORD = 'adminpass';

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email);
};

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      isAdmin: isAdminEmail(user.email || '')
    });
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    } else {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Check if this is the admin email and password
    if (isAdminEmail(email) && password === ADMIN_PASSWORD) {
      // Try to sign in with Firebase
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Ensure admin status in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName || email.split('@')[0],
          createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
          isAdmin: true
        }, { merge: true });
        
        return user;
      } catch (firebaseError: any) {
        // If user doesn't exist in Firebase Auth, create it
        if (firebaseError.code === 'auth/user-not-found') {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Create admin user in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString(),
            isAdmin: true
          });
          
          return user;
        }
        throw firebaseError;
      }
    }
    
    // Regular user login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // If user doesn't exist in Firestore but exists in Auth, create Firestore record
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        isAdmin: isAdminEmail(user.email || '')
      });
    } else {
      // Update existing user's admin status if email is in admin list
      const currentData = userDoc.data();
      if (isAdminEmail(user.email || '') && !currentData.isAdmin) {
        await setDoc(doc(db, 'users', user.uid), {
          ...currentData,
          isAdmin: true
        }, { merge: true });
      }
    }
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('This account is not registered. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please try again.');
    } else {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create one
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        createdAt: new Date().toISOString(),
        isAdmin: isAdminEmail(user.email || '')
      });
    } else {
      // Update existing user's admin status if email is in admin list
      const currentData = userDoc.data();
      if (isAdminEmail(user.email || '') && !currentData.isAdmin) {
        await setDoc(doc(db, 'users', user.uid), {
          ...currentData,
          isAdmin: true
        }, { merge: true });
      }
    }
    
    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Google login failed. Please try again.');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed.');
  }
};

export const getCurrentUser = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if auth is already initialized and user is available
    if (auth && auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      // If auth state hasn't changed, resolve with current user (might be null)
      resolve(auth?.currentUser || null);
    }, 3000); // 3 second timeout

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          clearTimeout(timeout);
          unsubscribe();
          resolve(user);
        },
        (error) => {
          clearTimeout(timeout);
          unsubscribe();
          console.error('Auth state change error:', error);
          // Resolve with null instead of rejecting to prevent page crashes
          resolve(null);
        }
      );
    } catch (error) {
      clearTimeout(timeout);
      console.error('Error setting up auth state listener:', error);
      // Fallback to currentUser if available
      resolve(auth?.currentUser || null);
    }
  });
};

export const isAdmin = async (user: any): Promise<boolean> => {
  if (!user) return false;
  // First check if email is in admin list
  if (isAdminEmail(user.email || '')) {
    return true;
  }
  // Then check Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return userDoc.data()?.isAdmin === true;
};
