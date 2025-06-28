
'use server';

import * as admin from 'firebase-admin';

// The service account object, as provided from the user's project files.
const serviceAccount = {
  "type": "service_account",
  "project_id": "temporal-harmony-oracle",
  "private_key_id": "f1884b9893fd7f04e1fbd82872d5e85701e79f03",
  // Using backticks (template literals) to correctly handle the multi-line private key string.
  // This is the definitive fix for the backend crashing issue.
  "private_key": `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZyzpC3fDcWLLS
stF0bP7c/MsnnOKxyQkMrDVo+jxAvZVMcU98jyjOg2nVs9bvQy5oMypkUbNf/js4
xAPlcb4SnF5asKEvf2oHfXUVkwpKX97H78glcVcryGe/CSbFebnepxZN6PHxEhnt
H//EWyhdx+1wPZxDDXQQHnuPrWGjyuAynK7bAeWyeYvq/MFmiIRw9sfIx8QWHmjE
62Gbb1yZF6uvM9OJN+xEnlYnWtKOeypj6Wwqp5gW5L3FRByY6fAtd4OFq360sx1Q
+pG4JbxPspCfX0NJh8yiyjyOIKm1N+zvfP7FGfuNiI+Lz1bvZw1VV8H9hRdyXsJ9
Zx1HEMc1AgMBAAECggEAByD5XXmlYGUD2qGXrKHdS49eHyp2tIVYZzwjL5yfO8RC
cbyn8o0LpvGf7xEico7zPJE0kxEmJKwUgd411wnWNznVXQHfW/r/VeyG/rq8viRg
s6n3PGiD4K8M3EpfPnZmfXGTj8XIvSoPqkmr/5Nqeq71KE5P9Tu1WWPro49aicSm
L5j9kSZ8TGXS6au3AFuG/xGiCX6a4L3sT3g0k2e8DQvivQQLoc5SeUo5/9qpp+TA
wfkzNXNddneJz+21SNM/fVdBEqvtCrC9KhFphLJLb6eGPwhPdUYpMoRMUWhguvrh
YzCdkieo5GV/O+gfySce05T9MH9eEuhFM1JIawNBmQKBgQD8Tej/2h5e5KDd79B2
Zu3iOzJOtQ9FeU4q0iJ9zQQU3uLHBxPWaJTEogqdYDZlK7DyuY1uO4zhVRKF8L52
OOZQPYA3kCWgZbtBI/048byvd2W0qxmV2hqUYVPrfY43qcUYLraQboPbRgrx995X
pxUPmKDaapZU82xiIXOjfG4W+QKBgQDc++kApPSoZ+2iYEYRSheNHgiOHPt6E/qw
ygXKAouK8PwbiNqnMPr0dgiiK+MFujFWjZ8g0RNoo9TGQNTpzbZvPg/qKeajhq8U
no+C/sqoGvy8gNZRjfRzQBAn4eo0wpWHyz+UfquPJSU/YbGpUfMBJZdV2+ShYHsEZ
tJ2vKRPVHQKBgQDxCjHGdQi82anCPkEnTPCJSMqoHRxo4BpImJbxHrN+iO2Y/W77
UNCIBtMjRO7SuuoDCjhPDr9p6w+WPMiJQ5TtJcRf0OvRkD9UXWCnTXNZIzVcZHY+
Dq+EAHPfMAVslCk6MPrulloXENKpeaaUPqy+rr50AitQh3SpmjG0LKQaQKBgQDO
yq1v/O016otlt9HZvAvt8nzvABAUXT3q0iI4t8j9bCV/XsG+UweEXDAYEhmP8nzZ
Eg4nF3+iHC2wmFqlr+tYjis2ZZ9+xzpvhit7OCYDykS/T2Rc9WdRAXaTH5ugOiM+
pW00BSbD5ebiEBIwnc0S4kiv3Nj0HVN2Sp6Em1wDwQKBgGFmjukxEC91Wij9XH+W
lKP9/6Ni5Vz67DB9UQNORn+wV5ct64/0bgwF+F5nX9AUxgt9Vidf6WXxVdiDXX5x
rMsSj0LOPH4ucRLBC4orUtbmLMlcf2Ia0LrquH458VmHTm/4DxIgEZsNgrNTFfH1
6HGXVRU8NMQj/NSMBrH3G7O2
-----END PRIVATE KEY-----`,
  "client_email": "firebase-adminsdk-fbsvc@temporal-harmony-oracle.iam.gserviceaccount.com",
  "client_id": "100530714765101568275",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40temporal-harmony-oracle.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// This block ensures Firebase Admin is initialized only once.
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
