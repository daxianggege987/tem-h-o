
'use server';

import * as admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

// Check if the app is already initialized to prevent errors during hot-reloading
// in development environments.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        // Manually constructing the credential object as per your suggestion
        // for maximum reliability.
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        // Crucially, replacing the escaped newlines with actual newlines.
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log("Firebase Admin SDK initialized successfully using manually constructed credentials.");
  } catch (error: any) {
    // Log a detailed error message if initialization fails.
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
    // Throwing the error can help in debugging by making the crash more visible in logs.
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

// Export the initialized services for use in other server-side files.
const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
