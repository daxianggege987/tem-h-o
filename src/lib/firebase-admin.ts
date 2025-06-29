'use server';

import * as admin from 'firebase-admin';

// The service account object. You will need to paste your private key below.
const serviceAccount = {
  type: "service_account",
  project_id: "temporal-harmony-oracle",
  private_key_id: "ae034e781fce174fdb0b1926172047ab208a8057",
  // PASTE YOUR PRIVATE KEY BETWEEN THE BACKTICKS (` `)
  // Ensure you include the entire key, from -----BEGIN... to ...END PRIVATE KEY-----
  private_key: `PASTE_YOUR_PRIVATE_KEY_HERE`,
  client_email: "firebase-adminsdk-fbsvc@temporal-harmony-oracle.iam.gserviceaccount.com",
  client_id: "100530714765101568275",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40temporal-harmony-oracle.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize the app only if it's not already initialized.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // The cert function is robust enough to handle the service account object directly.
      credential: admin.credential.cert(serviceAccount),
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
