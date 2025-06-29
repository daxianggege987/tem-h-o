
'use server';

import * as admin from 'firebase-admin';
// This is the standard and most reliable way to import credentials.
// It relies on Next.js's ability to handle JSON imports.
import serviceAccount from './serviceAccountKey.json';

// Check if the app is already initialized to prevent errors during hot-reloading
// in development environments.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // The admin.credential.cert() method correctly parses the imported JSON object.
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully via serviceAccountKey.json.");
  } catch (error: any) {
    // Log a detailed error message if initialization fails. This is crucial for debugging.
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
  }
}

// Export the initialized services for use in other server-side files.
const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
