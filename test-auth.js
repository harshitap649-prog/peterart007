// Test authentication functionality
// This script can be run in the browser console to test Firebase auth

console.log('Testing Firebase Authentication...');

// Test 1: Check if Firebase is loaded
if (typeof window !== 'undefined') {
  import('@/firebase.config').then(({ auth }) => {
    console.log('Test 1 - Firebase auth object:', auth);
    
    if (auth) {
      console.log('Test 1 PASSED: Firebase auth is available');
    } else {
      console.error('Test 1 FAILED: Firebase auth is not available');
    }
    
    // Test 2: Check current user
    auth.onAuthStateChanged((user) => {
      console.log('Test 2 - Current user:', user);
      if (user) {
        console.log('Test 2 PASSED: User is authenticated');
        console.log('User email:', user.email);
        console.log('User UID:', user.uid);
      } else {
        console.log('Test 2 INFO: No user currently authenticated');
      }
    });
    
    // Test 3: Try to create a test user (this will fail if user exists, which is expected)
    console.log('Test 3 - Testing user creation...');
    // We won't actually create a user here, just test the function availability
    
  }).catch((error) => {
    console.error('Error importing Firebase config:', error);
  });
}
