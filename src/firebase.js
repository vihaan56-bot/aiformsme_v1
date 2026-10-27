import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration with environment variable support & production defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhCpGl_vde3sUdma49Ei-RHvQIAdV5YQU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aiformsme-cc40f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aiformsme-cc40f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aiformsme-cc40f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "218740161680",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:218740161680:web:2eb8ae691471fbaebeec15",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-06XNZ7Z51F"
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app = null;
let db = null;
let auth = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);

    // Initialize Analytics if supported in the current environment
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch((err) => {
        console.warn('[FIREBASE] Analytics not supported in this environment:', err);
      });
    }

    console.log('[FIREBASE] Initialized Firestore and Auth successfully!');
  } catch (error) {
    console.error('[FIREBASE] Error initializing Firebase:', error);
  }
} else {
  console.warn(
    '[FIREBASE] Configuration variables missing. App will run in mock demo mode.'
  );
}

export { app, db, auth, analytics, isFirebaseConfigured, firebaseConfig };

