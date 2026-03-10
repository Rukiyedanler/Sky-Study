import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_d88D66hLgmYdELrct-ub_M5XW78q68U",
  authDomain: "sky-study-64aa3.firebaseapp.com",
  projectId: "sky-study-64aa3",
  storageBucket: "sky-study-64aa3.firebasestorage.app",
  messagingSenderId: "314654868816",
  appId: "1:314654868816:web:56c90a0b8d1d0ea82dd855",
  measurementId: "G-6KFFFZXZKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics ONLY for supported environments
let analytics: any = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.log('Analytics not supported in this environment');
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };

export default app;
