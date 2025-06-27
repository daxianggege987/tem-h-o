
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
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// ###################################################################################
// CRITICAL: THESE VALUES MUST COME FROM YOUR ACTUAL FIREBASE PROJECT'S CONFIGURATION.
// Go to Project settings > General > Your apps > Firebase SDK snippet > Config
// ###################################################################################
const firebaseConfig = {
  apiKey: "AIzaSyBn4Xt6pfKzLbzjNVOWslsdFt0pIHlyzCY",
  authDomain: "temporal-harmony-oracle.firebaseapp.com",
  projectId: "temporal-harmony-oracle",
  storageBucket: "temporal-harmony-oracle.firebasestorage.app",
  messagingSenderId: "332542513314",
  appId: "1:332542513314:web:c2ae85c02700fa3cd2c7fb"
};
// ###################################################################################
// END CRITICAL CONFIGURATION SECTION
// ###################################################################################

let app: FirebaseApp;

// This logic ensures that Firebase is initialized only once.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized with provided config.");
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

const auth = getAuth(app);
const db = getFirestore(app);
console.log("Firebase Auth and Firestore instances obtained.");

// Connect to Firebase Emulator Suite in development if enabled.
if (process.env.NODE_ENV === 'development') {
    // We check for the flag on the window object to avoid trying to connect multiple times.
    if (typeof window !== 'undefined' && !(window as any)._firebaseEmulatorsConnected) {
        // Set the flag *before* attempting to connect. This prevents a re-connection loop.
        (window as any)._firebaseEmulatorsConnected = true;

        // In most containerized cloud dev environments, 'localhost' correctly
        // resolves to the host machine from the browser's perspective.
        const hostname = 'localhost';
        console.log(`[DEV MODE] Attempting to connect to emulators on host: ${hostname}`);
        
        try {
          connectAuthEmulator(auth, `http://${hostname}:9099`, { disableWarnings: true });
          console.log("[DEV MODE] Auth emulator connection configured.");
          connectFirestoreEmulator(db, hostname, 8080);
          console.log("[DEV MODE] Firestore emulator connection configured.");
        } catch (e: any) {
          console.error("[DEV MODE] Error configuring emulator connection:", e.message);
          // If it fails, we don't want to crash the whole app. Log the error.
        }
    } else if (typeof window !== 'undefined') {
      console.log("[DEV MODE] Emulator connection attempt already made in this session.");
    }
} else {
  console.log("[PROD MODE] Connecting to LIVE Firebase services.");
  if (firebaseConfig.apiKey.includes("AIzaSyBn4Xt6pfKzLbzjNVOWslsdFt0pIHlyzCY")) {
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
  db,
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
};
