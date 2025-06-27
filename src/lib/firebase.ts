
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
// This is a robust way to handle Next.js hot-reloading.
if (process.env.NODE_ENV === 'development') {
    // We check for the flag on the window object to avoid trying to connect multiple times.
    if (typeof window !== 'undefined' && !(window as any)._firebaseEmulatorsConnected) {
        const hostname = window.location.hostname;
        console.log(`[DEV MODE] Attempting to connect to emulators on host: ${hostname}`);
        try {
          connectAuthEmulator(auth, `http://${hostname}:9099`, { disableWarnings: true });
          connectFirestoreEmulator(db, hostname, 8080);
          console.log("[DEV MODE] Successfully configured connection to Auth and Firestore emulators.");
          // Set a flag on the window object to indicate that emulators are connected.
          (window as any)._firebaseEmulatorsConnected = true;
        } catch (e: any) {
          console.error("[DEV MODE] Error configuring emulator connection:", e.message);
        }
    } else if (typeof window !== 'undefined' && (window as any)._firebaseEmulatorsConnected) {
      console.log("[DEV MODE] Emulators connection already established.");
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
