
import * as admin from 'firebase-admin';

// Using require for robustness in server environments to import the JSON module.
// This is the most reliable way to ensure the key is loaded correctly.
const serviceAccount = require('./serviceAccountKey.json');

// Check if the app is already initialized to prevent errors during hot-reloading.
if (!admin.apps.length) {
  try {
    // --- Start: Key Validation ---
    // This block validates the structure of the key file before we attempt to use it.
    if (
      !serviceAccount ||
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      console.error('CRITICAL: serviceAccountKey.json is missing or malformed. Essential properties (project_id, client_email, private_key) are required.');
      throw new Error("Invalid or incomplete service account key file structure. Please ensure 'serviceAccountKey.json' is correct.");
    }
    
    console.log("Service Account check passed. Using Project ID:", serviceAccount.project_id);
    console.log("Service Account Client Email:", serviceAccount.client_email);
    // --- End: Key Validation ---

    // Initialize Firebase Admin with the validated and processed credentials.
    // This is the most robust method, manually building the credential object.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        // THIS IS THE CRITICAL FIX: Replace escaped newlines with actual newlines.
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    console.log("Firebase Admin SDK initialized successfully.");

    // --- Start: Firestore Connection Test ---
    // This test will definitively tell us if the initialized app has the correct
    // permissions to communicate with the Firestore database.
    console.log("Attempting Firestore connection test...");
    const firestoreTest = admin.firestore();
    firestoreTest.collection('test-connection').doc('startup-doc').get()
      .then(doc => {
        if (!doc.exists) {
          console.log("Successfully connected to Firestore. Test document not found, creating one...");
          return firestoreTest.collection('test-connection').doc('startup-doc').set({
            status: 'connected',
            timestamp: new Date()
          });
        } else {
          console.log("Successfully connected to Firestore. Found existing test document:", doc.data());
          return doc.ref.update({ timestamp: new Date() });
        }
      })
      .then(() => {
          console.log("Firestore connection test completed successfully.");
      })
      .catch(error => {
        console.error("CRITICAL: Firestore API request failed after initialization.");
        console.error("This likely means there's a problem with permissions (IAM roles) or API enablement in your GCP project.");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("API response details:", JSON.stringify(error.response));
        }
      });
    // --- End: Firestore Connection Test ---

  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK setup failed.', error);
    // This will re-throw the error, likely causing the server to crash, but making the root cause very visible in the logs.
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
