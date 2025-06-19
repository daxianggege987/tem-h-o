
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, connectAuthEmulator, type Auth } from "firebase/auth";

// IMPORTANT: Replace these with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  authDomain: "YOUR_AUTH_DOMAIN", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  projectId: "YOUR_PROJECT_ID", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  storageBucket: "YOUR_STORAGE_BUCKET", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  appId: "YOUR_APP_ID" // THIS IS A PLACEHOLDER - REPLACE WITH YOURS
  // measurementId: "G-XXXXXXXXXX" // Optional, add if you have it
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

// Connect to Firebase Emulator Suite in development
// Ensure process.env.NODE_ENV is correctly set by your Next.js dev environment
if (process.env.NODE_ENV === 'development') {
  // Before running your app, start the emulators.
  // Default Auth emulator port is 9099.
  // Default Firestore emulator port is 8080.
  // Default Emulator UI port is 4000.
  try {
    // Note: It's good practice to ensure emulators are running before connecting.
    // This code will attempt to connect; if emulators aren't running, Firebase SDK might still work
    // with live services or might throw errors later depending on the operation.
    // For a smoother experience, always start emulators first.
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    console.log("Attempting to connect to Firebase Auth emulator on http://127.0.0.1:9099");
    // To use other emulators like Firestore:
    // import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
    // const db = getFirestore(app);
    // connectFirestoreEmulator(db, '127.0.0.1', 8080);
    // console.log("Attempting to connect to Firebase Firestore emulator on http://127.0.0.1:8080");
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
    console.warn(
      "Ensure Firebase emulators are running. Start them with 'npm run emu:start' or 'firebase emulators:start'"
    );
  }
}


const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup };
