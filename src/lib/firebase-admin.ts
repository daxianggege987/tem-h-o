
'use server';

import * as admin from 'firebase-admin';

// The service account object, with the private key correctly formatted using backticks (`).
// This is the definitive fix for the server-side crash.
const serviceAccount = {
  "type": "service_account",
  "project_id": "temporal-harmony-oracle",
  "private_key_id": "ae034e781fce174fdb0b1926172047ab208a8057",
  "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDac7E3O1OXsuLr\nqh+2AAbKr4WXb5XE5W8nEdyA7ohpVsiufeVikeGm3O8xjxBhsX5xv6bd9WZEMVts\nVYdYWLNyIXxTjN9yOtWehB6Qiz//WB9hbs2ZosLPiXNQJToi1YaxqXLo1pcu5cVe\nuShAPdntyZO8ES+OVjND4PHfmzhHcR473zpBXZoxpyDv+N2dc367KyYPcCQk1n9k\n5qEHdPyCy1YnFSiJn6GT9+ESb4k6AdEPsg7wThZFylImajHSpoCHhRwM7T7sZBSP\nv6InyR+/S/Y8aw5MHt4XAjV2YPnKWd4p9MxM9qSpAzV3nNHrDsjJNdnyvolwVlLa\nFmXUADPZAgMBAAECggEAC3xzorsRQePIx9892XC7wAVbHEjkd9d1e6PWM4b3RWH9\nXXlmqdhlpEOv0Fax+TpfMuVtcB8YBblk/Hesd7zQO03J7vhfA69Ww0XgooqD2Vio\nQRQAUQChxs5MHHhx9loXrI3uP2e7HXQ852ZhGKxNN2d23Q0NR6oTeiag082iTP/r\nhOADxHElgJvNOCNgihielfid26TgyBYFFDgsZlSRwXFP3gVQO7hkQy8A3lVNG90B\nfkv1Juq2h4zJRhmxiR7WZn00d+pTeXrNvG/7euSmKpBUJw9HxB+4isoGrylczG92\nSn6XRORRLlEocdx3/ONnWvXK39WuWmsxdAM5//6+ZQKBgQDvDbC+jRcJeurIkzeH\nAEYFoYPWo/LyEc0zOMZtRyvlJ+xk2fjf7OdS6iSGsi1JBVQVotaOwB010rDvETjw\n9vEnsMh+imPCTfit/BIHwGdqE6Qyedm/CAbV/S3931UwqWzQpfIQYwRUHpCIoBvI\nLg9vnFmywxZrlTcv3MYXnSS+XQKBgQDp8CCt5zuxJ1zgK6EjfdI/vBmk5Zl01vfm\nt3bY7JJC5QpkXx5oJWl3qP6t5bDq4HFhqNBS4uhUXfoka7NG5uk06EYjDqvHupky\nhKrkNv8SYDg1BlHUJGp+mBGbrUFqCftRgePI4pRDYaGDwFmuah2Sow1Is1CDhyUQ\nj/5nt3rbrQKBgDMS57ouhsd9vX/RBEIRquQ1F+fZ62QQrZjN/ocGd7hkCTua3nNp\nOBsc72Tf2JELVGWy/shM/3CqbScGtPW2rNtgB9YRVzMCWalCe8+wKegd/izSn9US\nr/M0PolJF/hnmloRumAJ57jZNuQZ4RWp0Z509y0cRUQDA2F0d9Y/usP5AoGAccln\ny86OPUPdK/hsv3uiuXd/rbIz6x3opKMWPrsLBVisrleJzbRs0VQ01FbFr+kNnSfk\ndHyD7w1q7y4nnFQSmLZl7wVizppXi7f1+104wjJlBH2Xba1s0ziaT/N8vtwuDt4z\n8nErFn81dYUo2eopijqe6n61qdQhViYD42TecF0CgYAaBUt3eQkA0PaCbEeZ+74F\nKhiC/0Fmxr7vjG0FmldYwYWBATzZ8Yp3/grasRqdSdeOS6SJoOWXDIyvZ+4KS2xA\nFA3ZYqhyAy0g5QRpGht0ZtUin7uBzKH0RAX37oVPr0ZK/QSoJok8rJ29uPXs/rnf\nreqD+i0DCMVIeRX1p/bBcQ==\n-----END PRIVATE KEY-----\n`,
  "client_email": "firebase-adminsdk-fbsvc@temporal-harmony-oracle.iam.gserviceaccount.com",
  "client_id": "100530714765101568275",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40temporal-harmony-oracle.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};


// This block ensures Firebase Admin is initialized only once and safely.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    // If initialization fails for any reason, log a critical error.
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
  }
}

const firestore = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestore, authAdmin };
