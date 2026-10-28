import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if credentials exist before initializing
const hasValidConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '');

let app = null;
let auth = null;
let googleProvider = null;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
} else {
  console.warn('Firebase configuration missing in environment. Please ensure .env contains REACT_APP_FIREBASE_API_KEY.');
}

export { auth, googleProvider };

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return {
      success: false,
      message: 'Firebase is not initialized. Please restart your frontend server so it loads the root .env file.'
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Firebase Google Sign-In Error:', error);
    return {
      success: false,
      message: error.message || 'Google sign-in failed'
    };
  }
};

export default app;
