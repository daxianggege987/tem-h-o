
// IMPORTANT: This API route needs Firebase Admin SDK properly configured
// with a service account key to mint custom tokens for real login.

import { type NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// --- Firebase Admin SDK Initialization ---
// CRITICAL: Replace '@/path/to/your/serviceAccountKey.json' with the ACTUAL PATH to your service account key.
// Store this key securely and DO NOT commit it to public repositories.
// For Next.js, path is relative to .next/server/app/api/verify-custom-otp/route.js after build.
// A path like '../../../../../serviceAccountKey.json' might work if key is at project root.
// Consider using environment variables for production to store service account credentials.
const SERVICE_ACCOUNT_KEY_PATH = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH || '../../../../../serviceAccountKey.json'; // Adjust as needed

try {
  if (!admin.apps.length) {
    // Check if the path is absolute or needs resolving. For simplicity, assuming it's resolvable.
    // In a real deployment, ensure this path is correct relative to where the function executes.
    const serviceAccount = require(SERVICE_ACCOUNT_KEY_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
} catch (e: any) {
  console.error('Firebase Admin SDK initialization error:', e.message);
  // If Admin SDK fails to initialize, token minting will fail.
  // You might want to throw an error or handle this more gracefully depending on your needs.
}
// --- End Firebase Admin SDK Initialization ---

const TEST_PHONE_NUMBER_E164 = "+8613181914554";
const BYPASS_OTP_CODE_FROM_CLIENT = "BYPASS_OTP_FOR_TEST_ACCOUNT";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body; // phoneNumber from client is raw 11 digits

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const formattedRequestPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+86${phoneNumber}`;
    let isOtpValid = false;

    if (formattedRequestPhoneNumber === TEST_PHONE_NUMBER_E164 && otp === BYPASS_OTP_CODE_FROM_CLIENT) {
      console.log(`Test account login attempt for ${formattedRequestPhoneNumber}. Bypassing OTP check.`);
      isOtpValid = true;
    } else {
      // CRITICAL: Implement actual OTP retrieval and validation from your database here.
      // This placeholder logic below is NOT secure for production for non-test accounts.
      console.warn(`OTP VALIDATION FOR NON-TEST ACCOUNT (${formattedRequestPhoneNumber}) IS A PLACEHOLDER.`);
      console.log(`Verifying OTP ${otp} for ${formattedRequestPhoneNumber}. Placeholder: checking against stored OTP.`);
      // Example:
      // const storedOtpData = await getOtpFromDatabase(formattedRequestPhoneNumber);
      // if (storedOtpData && storedOtpData.otp === otp && new Date() < storedOtpData.expiry && !storedOtpData.verified) {
      //   isOtpValid = true;
      //   await markOtpAsVerifiedInDatabase(formattedRequestPhoneNumber);
      // }
      
      // For demonstration purposes *only*, if you were to enable a bypass (NOT recommended for production):
      // if (otp === "VALID_OTP_PLACEHOLDER_FOR_NOW") { // A temporary measure if you need to test non-test flow
      //    isOtpValid = true;
      // }
      // In a real scenario, `isOtpValid` would remain false here unless the DB check passes.
    }

    if (!isOtpValid) {
         return NextResponse.json({ error: 'Invalid or expired OTP for non-test account, or test account bypass failed.', success: false }, { status: 400 });
    }

    // If OTP is valid (or bypassed for test account), mark it as verified in your database to prevent reuse
    // Example: await markOtpAsVerifiedInDatabase(formattedRequestPhoneNumber);

    let firebaseToken = null;
    if (!admin.apps.length) {
        console.error("Firebase Admin SDK not initialized. Cannot mint token.");
        // Fallback for local dev if service account isn't set up, but client will not sign in to Firebase.
         return NextResponse.json({ 
            success: true, // OTP part "succeeded" (or bypassed)
            message: 'OTP verified (or bypassed), but Firebase Admin SDK not ready. User NOT signed into Firebase.',
            token: null 
        });
    }

    try {
      // Ensure you have a unique UID for the user. Phone number can be used if unique.
      const uid = formattedRequestPhoneNumber; // Using E.164 phone number as UID
      firebaseToken = await admin.auth().createCustomToken(uid);
      console.log(`Firebase custom token minted for UID: ${uid}`);
    } catch (adminError: any) {
      console.error('Error creating Firebase custom token:', adminError);
      return NextResponse.json({ error: 'Failed to create Firebase session token', success: false }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: firebaseToken ? 'OTP verified successfully, Firebase token generated.' : 'OTP verified (or bypassed), but Firebase token generation failed or Admin SDK not ready.',
      token: firebaseToken
    });

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify OTP', success: false }, { status: 500 });
  }
}
