
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCustomToken } from "firebase/auth"; // Added signInWithCustomToken

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
// GoogleAuthProvider is kept for potential future use or removal if certain it's not needed.
const googleProvider = new GoogleAuthProvider(); 

// signInWithPhoneNumber and RecaptchaVerifier are removed as we're using a custom backend for OTP.
export { app, auth, googleProvider, signInWithCustomToken };
// ConfirmationResult type is removed.
