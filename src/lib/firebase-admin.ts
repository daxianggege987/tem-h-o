
import * as admin from 'firebase-admin';

// This is the most reliable way to ensure the key is loaded correctly in server environments.
// It relies on the serviceAccountKey.json file being correctly formatted.
const serviceAccount = require('./serviceAccountKey.json');

// Check if the app is already initialized to prevent errors during hot-reloading.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // The credential is created using the correctly parsed service account object.
      // The private key inside the JSON file MUST have its newlines escaped (\\n).
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
    // Re-throw to ensure the server fails to start if initialization is unsuccessful.
    throw new Error(`Firebase Admin SDK setup failed: ${error.message}`);
  }
}

const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
