
import * as admin from 'firebase-admin';

// This is the most reliable way to ensure the key is loaded correctly in server environments.
// We manually replace any escaped newlines to prevent parsing errors in different build environments.
let serviceAccount;
try {
  const serviceAccountConfig = require('./serviceAccountKey.json');
  serviceAccount = {
    ...serviceAccountConfig,
    private_key: serviceAccountConfig.private_key.replace(/\\n/g, '\n'),
  };
} catch (error) {
    console.error('CRITICAL: Failed to require or parse serviceAccountKey.json.', error);
    serviceAccount = null; // Set to null if file is missing or corrupt
}


// Check if the app is already initialized to prevent errors during hot-reloading.
if (!admin.apps.length) {
  // Only attempt to initialize if the service account was loaded successfully
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error('CRITICAL: Firebase Admin SDK initialization failed. Functions requiring admin privileges will not work.', error);
      // DO NOT re-throw. This prevents the entire server from crashing due to a configuration issue.
      // The application will remain operational, and routes that do not depend on firebase-admin will still work.
      // Dependent routes will fail gracefully later on.
    }
  } else {
      console.error('CRITICAL: Firebase Admin SDK cannot be initialized because service account credentials could not be loaded. Functions requiring admin privileges will not work.');
  }
}

const firestore = admin.apps.length ? admin.firestore() : null;
const authAdmin = admin.apps.length ? admin.auth() : null;

// We export the admin object itself, but also firestore and authAdmin which might be null if initialization failed.
// Code using these imports should handle the null case.
export { admin, firestore, authAdmin };
