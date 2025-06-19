
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, connectAuthEmulator, type Auth } from "firebase/auth";

// ###################################################################################
// CRITICAL: REPLACE THESE PLACEHOLDER VALUES WITH YOUR ACTUAL FIREBASE PROJECT CONFIG
// ###################################################################################
// You can find these in your Firebase project settings:
// Project settings > General tab > Your apps > Select your web app > SDK setup and configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  authDomain: "YOUR_AUTH_DOMAIN", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  projectId: "YOUR_PROJECT_ID", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  storageBucket: "YOUR_STORAGE_BUCKET", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  appId: "YOUR_APP_ID" // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  // measurementId: "G-XXXXXXXXXX" // Optional, add if you have it
};
// ###################################################################################
// END CRITICAL CONFIGURATION SECTION
// ###################################################################################

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized with provided config.");
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

auth = getAuth(app);
console.log("Firebase Auth instance obtained.");

// Connect to Firebase Emulator Suite in development
// Ensure process.env.NODE_ENV is correctly set by your Next.js dev environment (usually 'development' for `npm run dev`)
if (process.env.NODE_ENV === 'development') {
  // Check if critical firebaseConfig values are still placeholders
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.warn(
      "[FIREBASE WARNING] You are in development mode but your firebaseConfig in src/lib/firebase.ts still contains placeholder values. " +
      "While emulators might work for some local testing, these placeholders MUST be replaced with your actual Firebase project credentials " +
      "for connecting to live Firebase services or for production builds."
    );
  }
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    console.log("AuthContext: Successfully connected to Firebase Auth emulator at http://127.0.0.1:9099");
    // To use other emulators like Firestore:
    // import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
    // const db = getFirestore(app);
    // connectFirestoreEmulator(db, '127.0.0.1', 8080); // Default Firestore port
    // console.log("AuthContext: Attempting to connect to Firebase Firestore emulator at http://127.0.0.1:8080");
  } catch (error) {
    console.error("AuthContext: Error connecting to Firebase emulators:", error);
    console.warn(
      "AuthContext: Ensure Firebase emulators are running. Start them with 'npm run emu:start' (or your configured command) in a separate terminal."
    );
  }
} else {
  console.log("AuthContext: Running in production mode or emulators not configured for this environment. Connecting to live Firebase services.");
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error(
      "[FIREBASE CRITICAL ERROR] Your firebaseConfig in src/lib/firebase.ts contains placeholder values. " +
      "You MUST replace these with your actual Firebase project credentials for the app to function correctly in a deployed (non-emulator) environment."
    );
  }
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup };
