
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This simple in-memory cache will store secrets for a short duration
// to avoid fetching them from the API on every single request.
const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

// Helper function to get the latest version of a secret from Secret Manager
async function getSecretValue(secretName: string): Promise<string | null> {
  // For local development, prefer environment variables if they are set.
  if (process.env.NODE_ENV === 'development') {
    if (secretName === 'zpay-pid' && process.env.ZPAY_PID) {
      return process.env.ZPAY_PID;
    }
    if (secretName === 'zpay-key' && process.env.ZPAY_KEY) {
      return process.env.ZPAY_KEY;
    }
  }

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
    console.warn(`[Z-Pay] Warning: Secret ${secretName} has no payload.`);
    return null;
  } catch (error) {
    console.error(`[Z-Pay] CRITICAL: Failed to access secret ${secretName}. Ensure it exists and the service account has 'Secret Manager Secret Accessor' role. Error:`, error);
    // In local dev, we might fallback to env vars, so we don't throw an error here.
    return null;
  }
}


export async function POST(request: NextRequest) {
    // --- TEMPORARY CREDENTIALS FOR WEB-BASED DEVELOPMENT ENVIRONMENT ---
    // These will be used for testing. They MUST be removed before deployment.
    const ZPAY_PID_TEMP = "2025080213180664";
    const ZPAY_KEY_TEMP = "VrhOu7KntoIZbV8xFuNJWSIWjjuum6zg";
    
    let ZPAY_PID = ZPAY_PID_TEMP;
    let ZPAY_KEY = ZPAY_KEY_TEMP;

    // In a real deployed environment, it will still try to use Secret Manager for security.
    if (process.env.NODE_ENV === 'production' || !ZPAY_PID_TEMP) {
        ZPAY_PID = await getSecretValue("zpay-pid");
        ZPAY_KEY = await getSecretValue("zpay-key");
    }

    if (!ZPAY_PID || !ZPAY_KEY) {
        return NextResponse.json({ error: "Payment provider is not configured. Missing PID or Key." }, { status: 503 });
    }

    try {
        const { product, lang } = await request.json();

        if (!product || !product.price || !product.name) {
            return NextResponse.json({ error: "Product information is missing." }, { status: 400 });
        }

        const out_trade_no = `oracle_${Date.now()}${Math.floor(Math.random() * 1000)}`;
        // The notify_url needs to be a publicly accessible URL.
        // For production, this should be the deployed function URL.
        const notify_url = `https://choosewhatnow.com/api/zpay/notify`;
        const return_url = `https://choosewhatnow.com/${lang === 'zh-CN' ? 'reading' : 'en/reading'}`;

        const params: { [key: string]: string } = {
            pid: ZPAY_PID,
            type: 'wxpay', // or 'alipay' - can be made dynamic
            out_trade_no: out_trade_no,
            notify_url: notify_url,
            return_url: return_url,
            name: product.name,
            money: product.price,
            sign_type: 'MD5',
        };

        // Generate the signature
        const sortedKeys = Object.keys(params).sort();
        let signString = '';
        for (const key of sortedKeys) {
            if (params[key]) {
                 signString += `${key}=${params[key]}&`;
            }
        }
        signString = signString.slice(0, -1) + ZPAY_KEY;

        const sign = createHash('md5').update(signString).digest('hex');
        
        const responsePayload = {
            ...params,
            sign: sign,
        };

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error("Error creating Z-Pay order:", error);
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
