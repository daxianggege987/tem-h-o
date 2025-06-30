
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import client from '@/lib/paypal';
import { firestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper function to add years to a date
function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export async function POST(request: Request) {
  try {
    // userID is now optional for guest checkouts
    const { orderID, userID, productID } = await request.json(); 
    if (!orderID || !productID) {
      return NextResponse.json({ error: 'Order ID and Product ID are required.' }, { status: 400 });
    }

    const paypalRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    paypalRequest.requestBody({});

    const capture = await client.execute(paypalRequest);
    const captureData = capture.result;

    if (captureData.status !== 'COMPLETED') {
      // If payment is not completed for any reason, return the PayPal response.
      return NextResponse.json({ ...captureData });
    }
    
    // --- Entitlement granting logic ---
    // If a userID is provided (i.e., a logged-in user made the purchase), update their entitlements.
    if (userID) {
      console.log(`Payment successful for order ${orderID}. Granting entitlements to user ${userID} for product ${productID}.`);
      
      const userEntitlementsRef = firestore.collection('users').doc(userID);

      try {
        await firestore.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userEntitlementsRef);
          
          if (!userDoc.exists) {
            // If user somehow got deleted between login and purchase, log error but don't fail the payment response.
            throw new Error(`User document for UID ${userID} not found.`);
          }

          const entitlements = userDoc.data()?.entitlements || {};
          const now = new Date();
          let newEntitlements = { ...entitlements };

          switch (productID) {
            case 'one-time':
              newEntitlements.paidCredits = (entitlements.paidCredits || 0) + 10;
              break;
            case 'monthly':
              newEntitlements.isVip = true;
              const currentVipExpiry = (entitlements.vipExpiresAt && entitlements.vipExpiresAt.toDate() > now) 
                ? entitlements.vipExpiresAt.toDate() 
                : now;
              newEntitlements.vipExpiresAt = Timestamp.fromDate(addDays(currentVipExpiry, 30));
              break;
            case 'annual':
              newEntitlements.isVip = true;
               const currentAnnualVipExpiry = (entitlements.vipExpiresAt && entitlements.vipExpiresAt.toDate() > now) 
                ? entitlements.vipExpiresAt.toDate()
                : now;
              newEntitlements.vipExpiresAt = Timestamp.fromDate(addYears(currentAnnualVipExpiry, 1));
              break;
            // The new 'oracle-unlock' product ID for guests doesn't grant stored entitlements.
            // We can add logging for it here if desired.
            case 'oracle-unlock':
                console.log(`Guest user successfully unlocked a reading with productID: ${productID}`);
                break;
            default:
              throw new Error(`Unknown product ID for logged-in user: ${productID}`);
          }
          
          transaction.set(userEntitlementsRef, { entitlements: newEntitlements }, { merge: true });
        });
        
        console.log(`Successfully updated entitlements for user ${userID} in Firestore.`);
      } catch (dbError: any) {
        console.error(`Firestore entitlement update failed for user ${userID} after payment. CRITICAL: Manual intervention may be required.`, dbError);
        // Even if DB fails, the payment is already captured. We must return success to PayPal client, but log this critical error.
        return NextResponse.json({ ...captureData, firestore_error: `Failed to grant entitlements: ${dbError.message}` });
      }
    } else {
        // This is a guest checkout. Just log it.
        console.log(`Guest payment successful for order ${orderID} and product ${productID}. No entitlements to grant.`);
    }

    // Return the successful capture data to the client.
    return NextResponse.json({ ...captureData });
  } catch (err: any) {
    console.error("Failed to capture PayPal order:", err);
    const errorMessage = err.message || 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to capture order: ${errorMessage}` }, { status: 500 });
  }
}
