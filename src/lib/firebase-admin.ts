
'use server';

import * as admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

// Check if the app is already initialized to prevent errors during hot-reloading.
if (!admin.apps.length) {
  try {
    // --- Start: Key Validation as requested ---
    // Check if the imported service account key has the essential properties.
    if (
      !serviceAccount ||
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      // If the key is invalid, throw a very specific error to make debugging easier.
      console.error('CRITICAL: serviceAccountKey.json is missing or malformed. Essential properties (project_id, client_email, private_key) are required.');
      throw new Error("Invalid or incomplete service account key file structure. Please ensure 'serviceAccountKey.json' is correct.");
    }
    
    // Log key details for verification during startup.
    console.log("Service Account check passed. Using Project ID:", serviceAccount.project_id);
    console.log("Service Account Client Email:", serviceAccount.client_email);
    // --- End: Key Validation ---

    // Initialize Firebase Admin with the validated and processed credentials.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        // Crucially, replace the escaped newlines with actual newlines.
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error: any) {
    // This will catch both the validation error and any initialization errors.
    console.error('CRITICAL: Firebase Admin SDK setup failed.', error);
    // Re-throwing the error to ensure the server process stops with a clear failure message.
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

// Export the initialized services for use in other server-side files.
const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
