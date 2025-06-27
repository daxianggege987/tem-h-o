
import { NextResponse, type NextRequest } from 'next/server';
import { authAdmin, firestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const FREE_CREDIT_VALIDITY_HOURS = 72;
const INITIAL_FREE_CREDITS_AMOUNT = 10;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDocRef = firestore.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists) {
        // User exists in Auth but not Firestore. Create their document with initial entitlements.
        console.log(`API: User document for UID ${uid} not found. Creating with initial entitlements.`);
        
        // auth_time is in seconds, convert to milliseconds. Fallback to now.
        const creationTime = (decodedToken.auth_time * 1000) || Date.now();
        
        const newEntitlements = {
            freeCredits: INITIAL_FREE_CREDITS_AMOUNT,
            freeCreditsExpireAt: Timestamp.fromMillis(creationTime + (FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000)),
            paidCredits: 0,
            isVip: false,
            vipExpiresAt: null,
            lastConsumptionTime: 0,
        };
        
        const newUserDoc = {
            uid: uid,
            email: decodedToken.email,
            createdAt: Timestamp.fromMillis(creationTime),
            entitlements: newEntitlements,
        };

        // Write these entitlements to the database from the server.
        await userDocRef.set(newUserDoc);

        // Return the newly created entitlements directly.
        return NextResponse.json({
            freeCreditsRemaining: newEntitlements.freeCredits,
            freeCreditsExpireAt: newEntitlements.freeCreditsExpireAt.toMillis(),
            paidCreditsRemaining: newEntitlements.paidCredits,
            isVip: newEntitlements.isVip,
            vipExpiresAt: null,
        });
    }
    
    const entitlementsData = docSnap.data()?.entitlements || {};

    // Important: Convert Firestore Timestamps to milliseconds for JSON serialization
    const now = Date.now();
    const freeCreditsExpireTimestamp = entitlementsData.freeCreditsExpireAt?.toMillis() || 0;
    const hasFreeCreditsExpired = now >= freeCreditsExpireTimestamp;

    const responseData = {
        freeCreditsRemaining: hasFreeCreditsExpired ? 0 : entitlementsData.freeCredits || 0,
        freeCreditsExpireAt: freeCreditsExpireTimestamp,
        paidCreditsRemaining: entitlementsData.paidCredits || 0,
        isVip: entitlementsData.isVip || false,
        vipExpiresAt: entitlementsData.vipExpiresAt?.toMillis() || null,
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error fetching entitlements:', error);
    let errorMessage = 'An internal error occurred.';
    if (error.code === 'auth/id-token-expired') {
        errorMessage = 'Authentication token has expired. Please sign in again.';
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
    if (error.code === 'auth/argument-error') {
        errorMessage = 'Invalid authentication token.';
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
