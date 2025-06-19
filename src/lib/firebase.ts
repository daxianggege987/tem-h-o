
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  connectAuthEmulator, 
  signInWithEmailAndPassword
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
let auth; // Declare auth, but initialize after app

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized with provided config.");
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

auth = getAuth(app); // Initialize auth with the app-specific instance
console.log("Firebase Auth instance obtained.");

// Connect to Firebase Emulator Suite in development if enabled
if (process.env.NODE_ENV === 'development') {
  if (firebaseConfig.apiKey.startsWith("AIzaSy") && firebaseConfig.apiKey.includes("YOUR_API_KEY_PLACEHOLDER")) { // A more generic check for placeholder
    console.warn(
      "[FIREBASE WARNING] You are in development mode but your firebaseConfig in src/lib/firebase.ts appears to still contain placeholder values. " +
      "These placeholders MUST be replaced with your actual Firebase project credentials " +
      "for connecting to live Firebase services or for production builds. Emulators might bypass some of these checks for local testing."
    );
  }
  
  // To use the local Firebase Auth Emulator:
  // 1. Ensure Firebase emulators are running (e.g., `npm run emu:start`).
  // 2. Uncomment the connectAuthEmulator line below.
  // To use LIVE Firebase Auth services (e.g., for testing real Google Sign-In):
  // 1. Ensure this line is COMMENTED OUT.
  // 2. Make sure your `firebaseConfig` above has your REAL project credentials.
  // 3. Ensure your app's domain (e.g., localhost) is in "Authorized domains" in Firebase Console > Auth > Settings.
  
  // connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  // console.log("[DEV MODE] Attempting to connect to Firebase Auth emulator at http://127.0.0.1:9099 (if uncommented).");
  
  // Current default: Connect to LIVE Firebase services
  console.log("[DEV MODE] connectAuthEmulator is currently COMMENTED OUT. App will attempt to connect to LIVE Firebase services using the provided firebaseConfig.");
  if (firebaseConfig.apiKey.startsWith("AIzaSy") && firebaseConfig.apiKey.includes("YOUR_API_KEY_PLACEHOLDER")) {
      console.error("[DEV MODE] CRITICAL: firebaseConfig.apiKey is still a placeholder. Live Firebase connection will fail.");
  }

} else {
  console.log("[PROD MODE] Connecting to LIVE Firebase services.");
  if (firebaseConfig.apiKey.startsWith("AIzaSy") && firebaseConfig.apiKey.includes("YOUR_API_KEY_PLACEHOLDER")) {
    console.error(
      "[PROD MODE CRITICAL ERROR] Your firebaseConfig in src/lib/firebase.ts contains placeholder values. " +
      "You MUST replace these with your actual Firebase project credentials for the app to function correctly."
    );
  }
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup, signInWithEmailAndPassword };
