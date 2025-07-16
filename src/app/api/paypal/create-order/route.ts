
import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from 'next/server';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This simple in-memory cache will store secrets for a short duration
// to avoid fetching them from the API on every single request.
const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

// Helper function to get the latest version of a secret from Secret Manager
async function getSecretValue(secretName: string): Promise<string | null> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expires > Date.now()) {
    console.log(`[Secret Manager - PayPal] Returning cached value for ${secretName}.`);
    return cached.value;
  }

  console.log(`[Secret Manager - PayPal] Fetching new value for ${secretName}...`);
  const projectId = 'temporal-harmony-oracle';
  
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();
    
    if (payload) {
      console.log(`[Secret Manager - PayPal] Successfully fetched and cached value for ${secretName}.`);
      secretCache.set(secretName, { value: payload, expires: Date.now() + CACHE_DURATION_MS });
      return payload;
    }

    console.warn(`[Secret Manager - PayPal] Warning: Secret ${secretName} has no payload.`);
    return null;
  } catch (error) {
    console.error(`[Secret Manager - PayPal] CRITICAL: Failed to access secret ${secretName}. Error:`, error);
    return null;
  }
}

export async function POST(request: Request) {
    const clientId = await getSecretValue("paypal-client-id");
    const clientSecret = await getSecretValue("paypal-secret");

    if (!clientId || !clientSecret) {
        console.error("PayPal client ID or secret could not be retrieved from Secret Manager.");
        return NextResponse.json({ error: "Payment provider is not configured correctly." }, { status: 503 });
    }

    try {
        const { product } = await request.json();

        if (!product || !product.price || !product.description) {
            return NextResponse.json({ error: "Product information is required." }, { status: 400 });
        }

        const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
        const client = new paypal.core.PayPalHttpClient(environment);

        const paypalRequest = new paypal.orders.OrdersCreateRequest();
        paypalRequest.prefer("return=representation");
        paypalRequest.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: product.price,
                    },
                    description: product.description,
                },
            ],
        });

        const order = await client.execute(paypalRequest);
        
        return NextResponse.json({ id: order.result.id });

    } catch (err: any) {
        console.error("Error creating PayPal order:", err);
        if (err.statusCode) {
            let errorMessage = "Failed to create PayPal order.";
            try {
                const errorDetails = JSON.parse(err.message);
                if (errorDetails.name === 'AUTHENTICATION_FAILURE') {
                    errorMessage = "PayPal client authentication failed. Please check your credentials.";
                } else if (errorDetails.message) {
                    errorMessage = errorDetails.message;
                }
            } catch (e) {
                // Ignore if err.message is not JSON
            }
             return NextResponse.json({ error: errorMessage }, { status: err.statusCode });
        }
        
        return NextResponse.json({ error: "An internal server error occurred while creating the PayPal order." }, { status: 500 });
    }
}
