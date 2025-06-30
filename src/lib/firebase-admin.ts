
import * as admin from 'firebase-admin';

const serviceAccountConfig = require('./serviceAccountKey.json');

// This is the most reliable way to ensure the key is loaded correctly in server environments.
// We manually replace any escaped newlines to prevent parsing errors in different build environments.
const serviceAccount = {
  ...serviceAccountConfig,
  private_key: serviceAccountConfig.private_key.replace(/\\n/g, '\n'),
};


// Check if the app is already initialized to prevent errors during hot-reloading.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // The credential is created using the correctly formatted service account object.
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
