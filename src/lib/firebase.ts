
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, connectAuthEmulator, type Auth } from "firebase/auth";

// ###################################################################################
// CRITICAL: IF YOU HAVEN'T ALREADY, REPLACE THESE PLACEHOLDER VALUES
// WITH YOUR ACTUAL FIREBASE PROJECT CONFIG FROM THE FIREBASE CONSOLE.
// Project settings > General tab > Your apps > Select your web app > SDK setup and configuration
// ###################################################################################
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

// Connect to Firebase Emulator Suite in development if enabled
// To switch to LIVE Firebase services for development, comment out the connectAuthEmulator line.
if (process.env.NODE_ENV === 'development') {
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.warn(
      "[FIREBASE WARNING] You are in development mode but your firebaseConfig in src/lib/firebase.ts still contains placeholder values. " +
      "These placeholders MUST be replaced with your actual Firebase project credentials " +
      "for connecting to live Firebase services or for production builds. Emulators might bypass some of these checks for local testing."
    );
  }
  // To use the local Firebase Auth Emulator, uncomment the line below.
  // To use LIVE Firebase Auth services, ensure this line is COMMENTED OUT.
  /*
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    console.log("[DEV MODE] Successfully connected to Firebase Auth emulator at http://127.0.0.1:9099");
  } catch (error: any) {
    console.error("[DEV MODE] Error connecting to Firebase Auth emulator:", error.message);
    console.warn(
      "[DEV MODE] Ensure Firebase emulators are running if you intend to use them. Start with 'npm run emu:start'. " +
      "If you want to use LIVE Firebase services, ensure connectAuthEmulator is commented out."
    );
  }
  */
  console.log("[DEV MODE] connectAuthEmulator is currently commented out. App will attempt to connect to LIVE Firebase services using the provided firebaseConfig.");
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
      console.error("[DEV MODE] CRITICAL: firebaseConfig.apiKey is still a placeholder. Live Firebase connection will fail.");
  }

} else {
  console.log("[PROD MODE] Connecting to LIVE Firebase services.");
  if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error(
      "[PROD MODE CRITICAL ERROR] Your firebaseConfig in src/lib/firebase.ts contains placeholder values. " +
      "You MUST replace these with your actual Firebase project credentials for the app to function correctly."
    );
  }
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup };
