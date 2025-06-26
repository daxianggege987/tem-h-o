
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import client from '@/lib/paypal';
// We would import firebase admin here in a real scenario to grant entitlements
// import { admin } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const paypalRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    paypalRequest.requestBody({});

    const capture = await client.execute(paypalRequest);
    const captureData = capture.result;

    if (captureData.status === 'COMPLETED') {
      // TODO: Add logic to update user entitlements in Firestore
      // This is the critical point where you would grant the user what they paid for.
      // 1. Get the user's UID from the session (e.g., using Firebase Auth).
      // 2. Determine what was purchased from the capture data (e.g., product ID from `purchase_units`).
      // 3. Update the user's document in Firestore with new credits or VIP status.
      console.log(`Payment successful for order ${orderID}. User entitlements should be updated in Firestore now.`);
      
      // For example:
      // const userId = "some_user_id_from_session";
      // const productId = captureData.purchase_units[0].reference_id; // If you set a reference_id
      // await grantCreditsToUser(userId, productId);
    }

    return NextResponse.json({ ...captureData });
  } catch (err: any) {
    console.error("Failed to capture PayPal order:", err);
    // The error from PayPal often contains useful information
    const errorMessage = err.message || 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to capture order: ${errorMessage}` }, { status: 500 });
  }
}
