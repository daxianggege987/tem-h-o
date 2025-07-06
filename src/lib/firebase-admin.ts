
import * as admin from 'firebase-admin';

// =================================================================================
// PRODUCTION-READY Firebase Admin SDK Initialization
// =================================================================================
// This file has been updated for security and reliability in a production environment
// like Firebase App Hosting.

// CRITICAL SECURITY UPDATE:
// We no longer use a local `serviceAccountKey.json` file. Including private keys
// in the source code is a major security risk. The previous implementation has been removed.
// When deployed to a Google Cloud environment (like App Hosting), the Admin SDK
// automatically detects the correct service account credentials from the environment.
// This is the official, recommended, and most secure method.

if (!admin.apps.length) {
  try {
    // Calling initializeApp() without arguments in a Google Cloud environment
    // is the correct way to initialize. It uses the runtime's service account.
    admin.initializeApp();
    console.log("Firebase Admin SDK initialized successfully using application default credentials.");
  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK initialization failed. This can happen if the runtime environment does not have the necessary permissions. Functions requiring admin privileges will not work.', error);
    // In case of failure, dependent services will be null.
  }
}

// Safely export Firestore and Auth, handling the case where initialization might have failed.
const firestore = admin.apps.length ? admin.firestore() : null;
const authAdmin = admin.apps.length ? admin.auth() : null;

export { admin, firestore, authAdmin };
