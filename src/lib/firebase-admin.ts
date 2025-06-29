'use server';

import * as admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

// Check if the app is already initialized to prevent errors during hot-reloading
// in development environments.
if (!admin.apps.length) {
  try {
    // The user's friend correctly identified that the private key's newline
    // characters (\\n) in the JSON file need to be un-escaped into actual
    // newline characters (\n) for the SDK to parse them correctly.
    const serviceAccountWithFormattedKey = {
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountWithFormattedKey),
    });
    console.log("Firebase Admin SDK initialized successfully with formatted private key.");
  } catch (error: any) {
    // Log a detailed error message if initialization fails. This is crucial for debugging.
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
  }
}

// Export the initialized services for use in other server-side files.
const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
