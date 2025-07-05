import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkEBX6WZB4V68GtIEfUe49ImL2UliBWJU",
  authDomain: "geekfit-d84a7.firebaseapp.com",
  databaseURL: "https://geekfit-d84a7-default-rtdb.firebaseio.com",
  projectId: "geekfit-d84a7",
  storageBucket: "geekfit-d84a7.firebasestorage.app",
  messagingSenderId: "328734819499",
  appId: "1:328734819499:web:bb9891de9a54bf482f23ee",
  measurementId: "G-33Q4RB7BYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 