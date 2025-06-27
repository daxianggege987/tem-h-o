
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
let auth;
let db;
let emulatorsConnected = false; // Flag to ensure this only runs once

// This logic ensures that Firebase is initialized only once.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized with provided config.");
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
}

auth = getAuth(app);
db = getFirestore(app);
console.log("Firebase Auth and Firestore instances obtained.");

// Connect to Firebase Emulator Suite in development if enabled
if (process.env.NODE_ENV === 'development') {
  console.log("[DEV MODE] Checking for Firebase Emulators.");
  // This must run on the client side where `window` is available
  if (typeof window !== 'undefined' && !emulatorsConnected) {
      const hostname = window.location.hostname;
      console.log(`[DEV MODE] Attempting to connect to emulators on host: ${hostname}`);
      try {
        connectAuthEmulator(auth, `http://${hostname}:9099`, { disableWarnings: true });
        connectFirestoreEmulator(db, hostname, 8080);
        emulatorsConnected = true; // Set flag after attempting connection
        console.log("[DEV MODE] Successfully configured connection to Auth and Firestore emulators.");
      } catch (e: any) {
        console.error("[DEV MODE] Error configuring emulator connection:", e.message);
        // It's possible an error is thrown if already connected.
        // We can check the auth object to be sure.
        if (auth.emulatorConfig) {
            emulatorsConnected = true;
        }
      }
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
