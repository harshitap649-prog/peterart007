// Test script to verify Firebase authentication connection
// Run this in the browser console when the app is loaded

console.log('=== Firebase Authentication Test ===');

// Test 1: Check if Firebase modules are loaded
if (typeof window !== 'undefined') {
  // Check if we can access Firebase
  import('@/firebase.config').then(({ auth, db }) => {
    console.log('Test 1 - Firebase modules loaded:');
    console.log('Auth available:', !!auth);
    console.log('Firestore available:', !!db);
    
    // Test 2: Check auth state
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log('Test 2 - Auth state changed:');
        console.log('User authenticated:', !!user);
        if (user) {
          console.log('User email:', user.email);
          console.log('User UID:', user.uid);
          console.log('User email verified:', user.emailVerified);
        } else {
          console.log('No user currently authenticated');
        }
        unsubscribe();
      });
      
      // Test 3: Test login function availability
      import('@/lib/auth').then(({ loginWithEmail, signUpWithEmail, getCurrentUser }) => {
        console.log('Test 3 - Auth functions available:');
        console.log('loginWithEmail available:', typeof loginWithEmail === 'function');
        console.log('signUpWithEmail available:', typeof signUpWithEmail === 'function');
        console.log('getCurrentUser available:', typeof getCurrentUser === 'function');
        
        // Test 4: Try to get current user
        getCurrentUser().then(user => {
          console.log('Test 4 - Current user result:', user);
        }).catch(error => {
          console.error('Test 4 - Error getting current user:', error);
        });
      });
    }
  }).catch(error => {
    console.error('Error loading Firebase config:', error);
  });
}
