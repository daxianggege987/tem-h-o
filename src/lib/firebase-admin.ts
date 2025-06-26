
'use server';

import * as admin from 'firebase-admin';
import path from 'path';

// This file path is relative to the project root where the server is run.
const SERVICE_ACCOUNT_KEY_PATH = process.env.SERVICE_ACCOUNT_KEY_PATH || 'serviceAccountKey.json';

if (!admin.apps.length) {
    try {
        // Resolve path from the project root
        const absolutePath = path.resolve(process.cwd(), SERVICE_ACCOUNT_KEY_PATH);
        const serviceAccount = require(absolutePath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log(`Firebase Admin SDK initialized successfully from: ${absolutePath}`);
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.message);
        console.error('CRITICAL: Ensure your service account key is available at the specified path and the file is valid. By default, it looks for `serviceAccountKey.json` in your project root.');
    }
}

const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
