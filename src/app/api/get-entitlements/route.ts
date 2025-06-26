
import { NextResponse, type NextRequest } from 'next/server';
import { authAdmin, firestore } from '@/lib/firebase-admin';

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
        // This can happen for a user that exists in Auth but not Firestore yet.
        // The client-side logic already handles creating this, but we can return a default here.
        return NextResponse.json({
            freeCreditsRemaining: 0,
            freeCreditsExpireAt: null,
            paidCreditsRemaining: 0,
            isVip: false,
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
