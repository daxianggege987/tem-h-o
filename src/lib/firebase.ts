
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, type AuthProvider } from "firebase/auth"; // Added signInWithPopup, signInWithRedirect

// IMPORTANT: Replace these with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); 
// You can add more providers here, e.g.:
// import { FacebookAuthProvider } from "firebase/auth";
// const facebookProvider = new FacebookAuthProvider();

export { app, auth, googleProvider, signInWithPopup, signInWithRedirect };
// signInWithCustomToken is removed as custom OTP flow is disabled.
// ConfirmationResult type is removed.
