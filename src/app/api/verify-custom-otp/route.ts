
// IMPORTANT: This API route needs Firebase Admin SDK properly configured
// with a service account key to mint custom tokens for real login.

import { type NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import path from 'path'; // For resolving path

// --- Firebase Admin SDK Initialization ---
// CRITICAL: Replace '@/path/to/your/serviceAccountKey.json' with the ACTUAL PATH to your service account key.
// Store this key securely and DO NOT commit it to public repositories.
// For Next.js, path is relative to .next/server/app/api/verify-custom-otp/route.js after build.
// A path like '../../../../../serviceAccountKey.json' might work if key is at project root.
// Consider using environment variables for production to store service account credentials.
const SERVICE_ACCOUNT_KEY_PATH = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH || '../../../../../serviceAccountKey.json'; // Adjust as needed

try {
  if (!admin.apps.length) {
    // Resolve the path relative to the current file during runtime
    // This is a common pattern but might need adjustment based on your build output structure
    const absolutePath = path.resolve(SERVICE_ACCOUNT_KEY_PATH);
    console.log(`Attempting to load service account from: ${absolutePath}`);
    
    const serviceAccount = require(absolutePath); // Using resolved absolute path
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.log("Firebase Admin SDK already initialized.");
  }
} catch (e: any) {
  console.error('Firebase Admin SDK initialization error:', e.message);
  console.error('Detailed error:', e);
  // If Admin SDK fails to initialize, token minting will fail.
  // We will return an error response later if admin.apps.length is still 0.
}
// --- End Firebase Admin SDK Initialization ---

const TEST_PHONE_NUMBER_E164 = "+8613181914554";
const BYPASS_OTP_CODE_FROM_CLIENT = "BYPASS_OTP_FOR_TEST_ACCOUNT";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body; // phoneNumber from client is raw 11 digits

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required', success: false }, { status: 400 });
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
      console.log(`Verifying OTP ${otp} for ${formattedRequestPhoneNumber}. Placeholder: checking against stored OTP and expiry.`);
      // Example:
      // const storedOtpData = await getOtpFromDatabase(formattedRequestPhoneNumber);
      // if (storedOtpData && storedOtpData.otp === otp && new Date() < new Date(storedOtpData.expiry) && !storedOtpData.verified) {
      //   isOtpValid = true;
      //   await markOtpAsVerifiedInDatabase(formattedRequestPhoneNumber);
      // } else if (storedOtpData && new Date() >= new Date(storedOtpData.expiry)) {
      //   console.log("OTP expired.");
      // } else {
      //   console.log("Invalid OTP or already verified.");
      // }
      // For demonstration, assuming you'd implement this. For now, non-test accounts will fail.
    }

    if (!isOtpValid) {
         return NextResponse.json({ error: 'Invalid or expired OTP for non-test account, or test account bypass failed.', success: false }, { status: 400 });
    }

    // If OTP is valid (or bypassed for test account), mark it as verified in your database to prevent reuse
    // Example: await markOtpAsVerifiedInDatabase(formattedRequestPhoneNumber);

    if (!admin.apps.length) {
        console.error("Firebase Admin SDK not initialized. Cannot mint token. Check service account path and key.");
        return NextResponse.json({ 
            success: false, 
            error: 'OTP verified (or bypassed), but Firebase Admin SDK not initialized. Cannot create session token.',
            token: null 
        }, { status: 500 });
    }

    let firebaseToken = null;
    try {
      const uid = formattedRequestPhoneNumber; // Using E.164 phone number as UID
      console.log(`Attempting to create custom token for UID: ${uid}`);
      firebaseToken = await admin.auth().createCustomToken(uid);
      console.log(`Firebase custom token minted successfully for UID: ${uid}. Token: ${firebaseToken ? 'Generated' : 'NULL'}`);
    } catch (adminError: any) {
      console.error('Error creating Firebase custom token:', adminError.message);
      console.error('Detailed Admin Error:', adminError);
      return NextResponse.json({ error: `Failed to create Firebase session token: ${adminError.message}`, success: false }, { status: 500 });
    }
    
    if (!firebaseToken) {
      console.error('Firebase token was not generated, but no error was thrown by createCustomToken. This is unexpected.');
       return NextResponse.json({ 
        success: false, 
        error: 'OTP verified (or bypassed), but Firebase token generation failed silently.',
        token: null 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully, Firebase token generated.',
      token: firebaseToken
    });

  } catch (error: any) {
    console.error('Error in verify-custom-otp route:', error.message);
    console.error('Detailed Route Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify OTP', success: false }, { status: 500 });
  }
}
