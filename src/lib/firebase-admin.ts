'use server';

import * as admin from 'firebase-admin';

// Correctly load the service account JSON file.
// The `admin.credential.cert` function is designed to accept this object directly.
// No manual string manipulation of the private key is needed or correct.
import serviceAccountKey from '../../serviceAccountKey.json';

// Initialize the app only if it's not already initialized.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // Pass the entire service account object to the cert function.
      credential: admin.credential.cert(serviceAccountKey),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    // Log the critical error if initialization fails.
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
  }
}

// Export the initialized services.
const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
