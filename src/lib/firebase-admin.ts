
'use server';

import * as admin from 'firebase-admin';

// Re-import the service account key using a static import
// that is more friendly to the Next.js build process.
import serviceAccount from '../../serviceAccountKey.json';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
        });
        console.log(`Firebase Admin SDK initialized successfully.`);
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.message);
        console.error('CRITICAL: Ensure your service account key is available at the specified path and the file is valid. By default, it looks for `serviceAccountKey.json` in your project root.');
    }
}

const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
