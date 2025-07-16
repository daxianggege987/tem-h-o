
import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from 'next/server';
import { authAdmin, firestore } from '@/lib/firebase-admin';

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const clientSecret = process.env.PAYPAL_SECRET || "";

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request: Request) {
    if (!clientId || !clientSecret) {
        console.error("PayPal client ID or secret is not configured in environment variables.");
        return NextResponse.json({ error: "Payment provider is not configured correctly." }, { status: 503 });
    }
    
    if (!firestore || !authAdmin) {
        console.error("Firebase Admin SDK is not initialized. Cannot process order completion.");
        return NextResponse.json({ error: "Server configuration error. Cannot complete order." }, { status: 503 });
    }

    try {
        const { orderID, userID, productID } = await request.json();

        if (!orderID) {
            return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
        }

        const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
        captureRequest.requestBody({});

        const capture = await client.execute(captureRequest);

        const captureStatus = capture.result.status;
        if (captureStatus !== 'COMPLETED') {
            return NextResponse.json({ error: `Payment not completed. Status: ${captureStatus}`}, { status: 400 });
        }
        
        // --- Successful Payment Logic ---
        // At this point, the payment is successful. You can now grant entitlements.
        
        // If a logged-in user made the purchase, update their entitlements in Firestore.
        if (userID && productID) {
            const userDocRef = firestore.collection('users').doc(userID);
            
            // This is a simplified example. You would have more complex logic
            // to determine what to grant based on the productID.
            if (productID === 'annual' || productID.startsWith('source-code')) {
                 await firestore.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userDocRef);
                    if (!userDoc.exists) {
                        // This case should be rare if user is logged in
                        transaction.set(userDocRef, {
                            entitlements: { isVip: true, vipExpiresAt: null }
                        });
                    } else {
                        transaction.update(userDocRef, {
                           'entitlements.isVip': true,
                           'entitlements.vipExpiresAt': null // Represents lifetime
                        });
                    }
                });
            }
        }
        
        // For guest checkouts (userID is null), the success response is often enough.
        // The frontend will handle redirecting to the success page.

        return NextResponse.json({
            success: true,
            status: captureStatus,
            orderData: capture.result,
        });

    } catch (err: any) {
        console.error("Error capturing PayPal order:", err);
        let errorMessage = "An internal server error occurred.";
        let statusCode = 500;
        
        if (err.statusCode) {
            statusCode = err.statusCode;
            try {
                const errorDetails = JSON.parse(err.message);
                errorMessage = errorDetails.message || "Failed to capture payment.";
            } catch (e) {
                 errorMessage = "Failed to capture payment.";
            }
        }

        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}
