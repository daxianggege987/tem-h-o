
import { NextResponse, type NextRequest } from 'next/server';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import axios from 'axios';

const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

async function getSecretValue(secretName: string): Promise<string | null> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  const projectId = 'temporal-harmony-oracle';
  const client = new SecretManagerServiceClient({ projectId });
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();
    
    if (payload) {
      secretCache.set(secretName, { value: payload, expires: Date.now() + CACHE_DURATION_MS });
      return payload;
    }
    return null;
  } catch (error) {
    console.error(`[Secret Manager - Creem] CRITICAL: Failed to access secret ${secretName}. Please ensure the service account has the 'Secret Manager Secret Accessor' role. Error:`, error);
    return null;
  }
}

// NOTE: The success_url should be the page the user is redirected to *after* a successful payment.
const CREEM_PRODUCT_ID_ORACLE_UNLOCK = "prod_dfYrkm0u2AoY8fTXtVj1f";
const SUCCESS_URL = "https://choosewhatnow.com/payment-success";
const CANCEL_URL = "https://choosewhatnow.com/oracle";


export async function POST(request: NextRequest) {
    const creemApiKey = await getSecretValue("creem-api-key");

    if (!creemApiKey) {
        console.error("Creem API key could not be retrieved from Secret Manager.");
        return NextResponse.json({ error: "Payment provider is not configured correctly." }, { status: 503 });
    }

    try {
        const { product_id } = await request.json();

        // For now, we only have one product. We can expand this later.
        if (product_id !== 'oracle-unlock') {
            return NextResponse.json({ error: "Invalid product specified." }, { status: 400 });
        }
        
        const response = await axios.post(
            'https://api.creem.io/v1/checkouts',
            {
                product_id: CREEM_PRODUCT_ID_ORACLE_UNLOCK,
                success_url: SUCCESS_URL,
                cancel_url: CANCEL_URL,
            },
            {
                headers: { 
                    'x-api-key': creemApiKey,
                    'Content-Type': 'application/json'
                },
            }
        );

        const checkout_url = response.data.checkout_url;
        if (!checkout_url) {
            console.error("Creem API did not return a checkout_url");
            return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
        }

        return NextResponse.json({ checkout_url: checkout_url });

    } catch (err: any) {
        console.error("Error creating Creem checkout:", err.response ? err.response.data : err.message);
        return NextResponse.json({ error: "An internal server error occurred while creating the checkout session." }, { status: 500 });
    }
}
