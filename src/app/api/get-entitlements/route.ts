
import { NextResponse, type NextRequest } from 'next/server';
// import { authAdmin, firestore } from '@/lib/firebase-admin'; // Temporarily disabled for debugging
// import { Timestamp } from 'firebase-admin/firestore'; // Temporarily disabled

const FREE_CREDIT_VALIDITY_HOURS = 72;
const INITIAL_FREE_CREDITS_AMOUNT = 10;
const TEST_ACCOUNT_EMAIL = '94722424@qq.com';

export async function GET(request: NextRequest) {
  // --- TEMPORARY DEBUGGING RESPONSE ---
  // This is a fake response to test if the API route itself can run
  // without crashing the server by importing the firebase-admin module.
  // If you log in and see this data on your profile without an error,
  // it proves the problem is isolated to the firebase-admin.ts initialization.
  console.log('[Entitlements API] DEBUG MODE: Returning dummy data to test server stability.');
  return NextResponse.json({
    freeCreditsRemaining: 5,
    freeCreditsExpireAt: Date.now() + 24 * 60 * 60 * 1000,
    paidCreditsRemaining: 50,
    isVip: true,
    vipExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  // --- END TEMPORARY DEBUGGING RESPONSE ---


  /* --- ORIGINAL CODE DISABLED FOR DEBUGGING ---
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Entitlements API] Auth Error: No token provided.');
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Robustly fetch user record by UID to get a guaranteed email.
    const userRecord = await authAdmin.getUser(uid);
    // SAFELY handle the email, which could be undefined.
    const email = userRecord.email;

    console.log(`[Entitlements API] Verified token for UID: ${uid}. Fetched email from admin record: '${email}'`);

    // SPECIAL TEST ACCOUNT LOGIC: Safely check the email.
    if (email && email.toLowerCase() === TEST_ACCOUNT_EMAIL) {
      console.log(`[Entitlements API] SUCCESS: Matched test account '${email}'. Applying special entitlements.`);
      return NextResponse.json({
        freeCreditsRemaining: 10,
        freeCreditsExpireAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        paidCreditsRemaining: 100, // Explicitly setting 100 paid credits for the test account.
        isVip: true,
        vipExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });
    }
    
    console.log(`[Entitlements API] INFO: Did not match test account. Proceeding with normal user logic for UID ${uid}.`);

    const userDocRef = firestore.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists) {
        console.log(`[Entitlements API] User document for UID ${uid} not found. Creating new document.`);
        const creationTime = (decodedToken.auth_time * 1000) || Date.now();
        const newEntitlements = {
            freeCredits: INITIAL_FREE_CREDITS_AMOUNT,
            freeCreditsExpireAt: Timestamp.fromMillis(creationTime + (FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000)),
            paidCredits: 0,
            isVip: false,
            vipExpiresAt: null,
            lastConsumptionTime: 0,
        };
        await userDocRef.set({
            uid: uid,
            email: email, // Store the fetched email, which can be undefined.
            createdAt: Timestamp.fromMillis(creationTime),
            entitlements: newEntitlements,
        });
        return NextResponse.json({
            freeCreditsRemaining: newEntitlements.freeCredits,
            freeCreditsExpireAt: newEntitlements.freeCreditsExpireAt.toMillis(),
            paidCreditsRemaining: newEntitlements.paidCredits,
            isVip: newEntitlements.isVip,
            vipExpiresAt: null,
        });
    }
    
    const entitlementsData = docSnap.data()?.entitlements || {};
    const now = Date.now();
    const freeCreditsExpireAtTimestamp = entitlementsData.freeCreditsExpireAt?.toMillis() || 0;
    const hasFreeCreditsExpired = now >= freeCreditsExpireAtTimestamp;

    const responseData = {
        freeCreditsRemaining: hasFreeCreditsExpired ? 0 : entitlementsData.freeCredits || 0,
        freeCreditsExpireAt: freeCreditsExpireAtTimestamp,
        paidCreditsRemaining: entitlementsData.paidCredits || 0,
        isVip: entitlementsData.isVip || false,
        vipExpiresAt: entitlementsData.vipExpiresAt?.toMillis() || null,
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('CRITICAL ERROR in /api/get-entitlements:', error);
    let errorMessage = 'An internal server error occurred while fetching entitlements.';
    let statusCode = 500;

    if (error.code === 'auth/id-token-expired') {
        errorMessage = 'Authentication token has expired. Please sign in again.';
        statusCode = 401;
    } else if (error.code === 'auth/argument-error') {
        errorMessage = 'Invalid authentication token.';
        statusCode = 401;
    } else if (error instanceof TypeError) {
        // This will catch errors like calling a method on an undefined object.
        errorMessage = `A server-side type error occurred: ${error.message}`;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
  --- END ORIGINAL CODE DISABLED --- */
}
