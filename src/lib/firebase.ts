import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  connectAuthEmulator, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";

// ###################################################################################
// CRITICAL: IF YOU HAVEN'T ALREADY, REPLACE THESE PLACEHOLDER VALUES
// WITH YOUR ACTUAL FIREBASE PROJECT CONFIG FROM THE FIREBASE CONSOLE.
// ###################################################################################
const firebaseConfig = {
  apiKey: "AIzaSyBn4Xt6pfKzLbzjNVOWslsdFt0pIHlyzCY", // REPLACE WITH YOURS
  authDomain: "temporal-harmony-oracle.firebaseapp.com", // REPLACE WITH YOURS
  projectId: "temporal-harmony-oracle", // REPLACE WITH YOURS
  storageBucket: "temporal-harmony-oracle.firebasestorage.app", // REPLACE WITH YOURS
  messagingSenderId: "332542513314", // REPLACE WITH YOURS
  appId: "1:332542513314:web:c2ae85c02700fa3cd2c7fb" // REPLACE WITH YOURS
};
// ###################################################################################
// END CRITICAL CONFIGURATION SECTION
// ###################################################################################

let app: FirebaseApp;
let auth;

// This logic ensures that Firebase is initialized only once.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized with provided config.");
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

auth = getAuth(app);
console.log("Firebase Auth instance obtained.");

// Connect to Firebase Emulator Suite in development if enabled
if (process.env.NODE_ENV === 'development') {
  console.log("[DEV MODE] Checking for Firebase Emulators.");
  // To use the local Firebase Auth Emulator:
  // 1. Ensure Firebase emulators are running (e.g., `npm run emu:start`).
  // 2. Uncomment the connectAuthEmulator line below.
  // connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  console.log("[DEV MODE] connectAuthEmulator is currently COMMENTED OUT. App will attempt to connect to LIVE Firebase services using the provided firebaseConfig.");

  if (firebaseConfig.apiKey.startsWith("AIzaSy") && firebaseConfig.apiKey.includes("PLACEHOLDER")) {
      console.error("[DEV MODE] CRITICAL: firebaseConfig values are still placeholders. Live Firebase connection will fail.");
  }
} else {
  console.log("[PROD MODE] Connecting to LIVE Firebase services.");
  if (firebaseConfig.apiKey.startsWith("AIzaSy") && firebaseConfig.apiKey.includes("PLACEHOLDER")) {
    console.error(
      "[PROD MODE CRITICAL ERROR] Your firebaseConfig in src/lib/firebase.ts contains placeholder values. " +
      "You MUST replace these with your actual Firebase project credentials for the app to function correctly."
    );
  }
}

const googleProvider = new GoogleAuthProvider();

export { 
  app, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
};