
// IMPORTANT: This API route needs Firebase Admin SDK properly configured
// with a service account key to mint custom tokens for real login.

import { type NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import path from 'path'; // For resolving path

// --- Firebase Admin SDK Initialization ---
// CRITICAL: 
// 1. Download your service account key JSON file from Firebase Console 
//    (Project settings > Service accounts > Generate new private key).
// 2. Place it in your project (e.g., at the root, named 'serviceAccountKey.json').
// 3. For production, use environment variables to store service account credentials securely.
//    You can set FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH to the path of your key file.
//    If not set, it defaults to 'serviceAccountKey.json' in the project root.
const SERVICE_ACCOUNT_KEY_PATH = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json'; // UPDATED DEFAULT

try {
  if (!admin.apps.length) {
    // path.resolve will attempt to create an absolute path.
    // If SERVICE_ACCOUNT_KEY_PATH is 'serviceAccountKey.json' (and it's in the project root),
    // and your app's current working directory (CWD) is the project root, this will work.
    const absolutePath = path.resolve(SERVICE_ACCOUNT_KEY_PATH);
    console.log(`Attempting to load service account from: ${absolutePath}`);
    
    // The require call needs the resolved absolute path to the JSON file.
    const serviceAccount = require(absolutePath); 
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.log("Firebase Admin SDK already initialized.");
  }
} catch (e: any) {
  console.error('Firebase Admin SDK initialization error:', e.message);
  console.error('Detailed error (check if the path to service account key is correct and file exists):', e);
  // In a real app, you might want to prevent the API from proceeding if Admin SDK fails.
  // For now, it will log the error and subsequent operations might fail.
}
// --- End Firebase Admin SDK Initialization ---

const TEST_PHONE_NUMBER_E164 = "+8613181914554";
const TEST_OTP_FOR_TEST_ACCOUNT = "111111"; // Fixed OTP for the test account

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body; // phoneNumber from client is raw 11 digits

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required', success: false }, { status: 400 });
    }

    // Ensure phone number is in E.164 format for consistency, especially for UID.
    const formattedRequestPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}`;
    let isOtpValid = false;

    // Check for test account
    if (formattedRequestPhoneNumber === TEST_PHONE_NUMBER_E164 && otp === TEST_OTP_FOR_TEST_ACCOUNT) {
      console.log(`Test account OTP verification for ${formattedRequestPhoneNumber} with OTP ${otp}.`);
      isOtpValid = true;
    } else {
      // CRITICAL: Implement actual OTP retrieval and validation from your database here for non-test accounts.
      // This placeholder logic below is NOT secure for production for non-test accounts.
      console.warn(`OTP VALIDATION FOR NON-TEST ACCOUNT (${formattedRequestPhoneNumber}) OR MISMATCHED TEST OTP. Placeholder logic used.`);
      console.log(`Verifying OTP ${otp} for ${formattedRequestPhoneNumber}. You need to implement database check (retrieve OTP, check expiry, mark as verified).`);
      // Example (needs actual implementation with a database like Firestore):
      // const storedOtpData = await getOtpFromDatabase(formattedRequestPhoneNumber); // Retrieve OTP and expiry
      // if (storedOtpData && storedOtpData.otp === otp && new Date() < new Date(storedOtpData.expiry) && !storedOtpData.verified) {
      //   isOtpValid = true;
      //   await markOtpAsVerifiedInDatabase(formattedRequestPhoneNumber); // Mark as verified to prevent reuse
      // } else if (storedOtpData && new Date() >= new Date(storedOtpData.expiry)) {
      //   console.log("OTP expired for non-test account.");
      // } else {
      //   console.log("Invalid OTP or already verified for non-test account.");
      // }
      // For demonstration, non-test accounts will currently fail validation here unless you implement the above.
      // To allow any 6-digit OTP for other numbers temporarily for testing (REMOVE FOR PRODUCTION):
      // if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      //   console.warn("ALLOWING ANY 6-DIGIT OTP FOR NON-TEST ACCOUNT - REMOVE FOR PRODUCTION");
      //   isOtpValid = true;
      // }
    }

    if (!isOtpValid) {
         return NextResponse.json({ error: 'Invalid or expired OTP.', success: false }, { status: 400 });
    }

    // If OTP is valid, you would typically mark it as verified in your database here to prevent reuse (if you implemented that)
    // Example: await markOtpAsVerifiedInDatabase(formattedRequestPhoneNumber);

    // Ensure Admin SDK is initialized before trying to use it
    if (!admin.apps.length || !admin.app().name) { // Check if an app is truly initialized
        console.error("Firebase Admin SDK not initialized. Cannot mint token. Check service account path and key.");
        return NextResponse.json({ 
            success: false, 
            error: 'OTP verified, but Firebase Admin SDK not initialized. Cannot create session token. Check server logs for Admin SDK errors.',
            token: null 
        }, { status: 500 });
    }

    let firebaseToken = null;
    try {
      // Using E.164 phone number as UID. Ensure this is consistent with how you want to identify users.
      const uid = formattedRequestPhoneNumber; 
      console.log(`Attempting to create custom token for UID: ${uid}`);
      firebaseToken = await admin.auth().createCustomToken(uid);
      console.log(`Firebase custom token minted successfully for UID: ${uid}. Token: ${firebaseToken ? 'Generated' : 'NULL'}`);
    } catch (adminError: any) {
      console.error('Error creating Firebase custom token:', adminError.message);
      console.error('Detailed Admin Error:', adminError);
      return NextResponse.json({ error: `Failed to create Firebase session token: ${adminError.message}`, success: false }, { status: 500 });
    }
    
    if (!firebaseToken) {
      // This case should ideally be caught by the try/catch above if createCustomToken fails.
      // But as a safeguard:
      console.error('Firebase token was not generated, but no error was thrown by createCustomToken. This is unexpected.');
       return NextResponse.json({ 
        success: false, 
        error: 'OTP verified, but Firebase token generation failed silently. Check server logs.',
        token: null 
      }, { status: 500 });
    }

    // Successfully verified OTP and minted token
    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully, Firebase token generated.',
      token: firebaseToken
    });

  } catch (error: any) {
    // Catch-all for any other unexpected errors in the route
    console.error('Error in verify-custom-otp route:', error.message);
    console.error('Detailed Route Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify OTP', success: false }, { status: 500 });
  }
}
