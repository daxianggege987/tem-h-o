
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, type AuthProvider } from "firebase/auth"; // signInWithRedirect removed

// IMPORTANT: Replace these with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "AIzaSyBn4Xt6pfKzLbzjNVOWslsdFt0pIHlyzCY", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  authDomain: "temporal-harmony-oracle.firebaseapp.com", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  projectId: "temporal-harmony-oracle", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  storageBucket: "temporal-harmony-oracle.firebasestorage.app", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  messagingSenderId: "332542513314", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  appId: "1:332542513314:web:c2ae85c02700fa3cd2c7fb" // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  // measurementId: "G-XXXXXXXXXX" // Optional, add if you have it
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup };
