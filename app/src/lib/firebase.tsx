import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBD6mKc5JxZczg_0odXTBuTI8nIcyDJ2tU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "warner-music-staging.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "warner-music-staging",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "warner-music-staging.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "346184616943",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:346184616943:web:7b98e60cedc7770503841a"
};

// Initialize Firebase (singleton pattern)
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Connect to emulators in development
if (import.meta.env.DEV && !auth.emulatorConfig) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Initialize Analytics (optional)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp);
    }
  });
}

export { firebaseApp, auth, db, analytics };