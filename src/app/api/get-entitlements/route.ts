
import { NextResponse, type NextRequest } from 'next/server';
import { authAdmin, firestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const FREE_CREDIT_VALIDITY_HOURS = 72;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Special handling for the test account to ensure it always has entitlements.
    if (decodedToken.email === '94722424@qq.com') {
      console.log(`API: Test account ${decodedToken.email} detected. Seeding and returning entitlements.`);
      const userDocRef = firestore.collection('users').doc(uid);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      const testEntitlements = {
          freeCredits: 10,
          freeCreditsExpireAt: Timestamp.fromMillis(Date.now() + (FREE_CREDIT_VALIDITY_HOURS * 60 * 60 * 1000)),
          paidCredits: 100,
          isVip: true,
          vipExpiresAt: Timestamp.fromDate(oneYearFromNow),
      };
      
      // Write these entitlements to the database from the server. This bypasses client security rules.
      await userDocRef.set({ entitlements: testEntitlements }, { merge: true });

      // Return the seeded entitlements directly.
      return NextResponse.json({
          freeCreditsRemaining: 10,
          freeCreditsExpireAt: testEntitlements.freeCreditsExpireAt.toMillis(),
          paidCreditsRemaining: 100,
          isVip: true,
          vipExpiresAt: testEntitlements.vipExpiresAt.toMillis(),
      });
    }

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
