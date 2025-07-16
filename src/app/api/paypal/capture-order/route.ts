
import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from 'next/server';
import { authAdmin, firestore } from '@/lib/firebase-admin';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This simple in-memory cache will store secrets for a short duration
// to avoid fetching them from the API on every single request.
const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

// Helper function to get the latest version of a secret from Secret Manager
async function getSecretValue(secretName: string): Promise<string | null> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expires > Date.now()) {
    console.log(`[Secret Manager - PayPal Capture] Returning cached value for ${secretName}.`);
    return cached.value;
  }

  console.log(`[Secret Manager - PayPal Capture] Fetching new value for ${secretName}...`);
  const projectId = 'temporal-harmony-oracle';
  
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();
    
    if (payload) {
      console.log(`[Secret Manager - PayPal Capture] Successfully fetched and cached value for ${secretName}.`);
      secretCache.set(secretName, { value: payload, expires: Date.now() + CACHE_DURATION_MS });
      return payload;
    }

    console.warn(`[Secret Manager - PayPal Capture] Warning: Secret ${secretName} has no payload.`);
    return null;
  } catch (error) {
    console.error(`[Secret Manager - PayPal Capture] CRITICAL: Failed to access secret ${secretName}. Error:`, error);
    return null;
  }
}

export async function POST(request: Request) {
    const clientId = await getSecretValue("paypal-client-id");
    const clientSecret = await getSecretValue("paypal-secret");

    if (!clientId || !clientSecret) {
        console.error("PayPal client ID or secret could not be retrieved from Secret Manager for capture.");
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
        
        const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
        const client = new paypal.core.PayPalHttpClient(environment);

        const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
        captureRequest.requestBody({});

        const capture = await client.execute(captureRequest);

        const captureStatus = capture.result.status;
        if (captureStatus !== 'COMPLETED') {
            return NextResponse.json({ error: `Payment not completed. Status: ${captureStatus}`}, { status: 400 });
        }
        
        if (userID && productID) {
            const userDocRef = firestore.collection('users').doc(userID);
            
            if (productID === 'annual' || productID.startsWith('source-code')) {
                 await firestore.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userDocRef);
                    if (!userDoc.exists) {
                        transaction.set(userDocRef, {
                            entitlements: { isVip: true, vipExpiresAt: null }
                        });
                    } else {
                        transaction.update(userDocRef, {
                           'entitlements.isVip': true,
                           'entitlements.vipExpiresAt': null
                        });
                    }
                });
            } else if (productID === 'oracle-unlock-298') {
                 // For one-time unlock, we don't grant long-term entitlements.
                 // The frontend handles the session unlock. We just confirm payment.
                 console.log(`[PayPal Capture] Successfully processed one-time unlock for user ${userID}`);
            }
        }
        
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
