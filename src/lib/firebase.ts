
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
  console.log("Firebase app initialized.");
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

// NOTE: The development emulator connection logic has been removed.
// The app will now always connect to the live Firebase services as defined
// in the `firebaseConfig` object above. This ensures consistent behavior
// between development and production environments and resolves connection issues
// in cloud-based IDEs.

// In a production environment, it's critical to ensure the firebaseConfig values are not placeholders.
if (process.env.NODE_ENV === 'production' && firebaseConfig.apiKey.startsWith("AIzaSyB")) {
  console.error(
    "CRITICAL WARNING: Your application is running in production but appears to be using placeholder Firebase credentials. " +
    "You MUST replace the values in 'firebaseConfig' in 'src/lib/firebase.ts' with your actual project credentials."
  );
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
