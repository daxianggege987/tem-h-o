
// FINAL IMPLEMENTATION: Actively fetch secrets from Secret Manager using the Node.js client library.
// This is the most robust method, bypassing any potential issues with environment variable injection in App Hosting.

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This simple in-memory cache will store secrets for a short duration
// to avoid fetching them from the API on every single request.
const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

// Helper function to get the latest version of a secret from Secret Manager
async function getSecretValue(secretName: string): Promise<string | null> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expires > Date.now()) {
    console.log(`[Secret Manager] Returning cached value for ${secretName}.`);
    return cached.value;
  }

  console.log(`[Secret Manager] Fetching new value for ${secretName}...`);
  // CRITICAL FIX: Hardcode the project ID to ensure reliability.
  const projectId = 'temporal-harmony-oracle';
  
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();
    
    if (payload) {
      console.log(`[Secret Manager] Successfully fetched and cached value for ${secretName}.`);
      secretCache.set(secretName, { value: payload, expires: Date.now() + CACHE_DURATION_MS });
      return payload;
    }

    console.warn(`[Secret Manager] Warning: Secret ${secretName} has no payload.`);
    return null;
  } catch (error) {
    console.error(`[Secret Manager] CRITICAL: Failed to access secret ${secretName}. Error:`, error);
    // This often indicates a permissions issue. Ensure the App Hosting backend service account
    // has the 'Secret Manager Secret Accessor' role for this secret.
    return null;
  }
}

// A simple in-memory store to simulate order status.
// In a real app, use a database like Firestore.
const mockOrderStatusStore = new Map<string, 'NOTPAY' | 'SUCCESS'>();

// Endpoint to create a mock WeChat Pay order
export async function POST(request: Request) {
  const { product } = await request.json();

  if (!product || !product.description || !product.price) {
    return NextResponse.json({ error: 'Product information is required.' }, { status: 400 });
  }

  // Actively fetch all required secrets
  const weChatAppId = await getSecretValue('wechat-app-id');
  const weChatMchId = await getSecretValue('wechat-mch-id');
  const weChatApiKey = await getSecretValue('wechat-api-v3-key');

  // Check if any secret is missing and return a specific error
  if (!weChatAppId) {
    const errorMsg = "WeChat Pay AppID is not configured. Please ensure a secret named `wechat-app-id` exists and the backend has permission to access it.";
    console.error(`Configuration Error: ${errorMsg}`);
    return NextResponse.json({ error: `Payment provider configuration error: ${errorMsg}` }, { status: 503 });
  }
  if (!weChatMchId) {
    const errorMsg = "WeChat Pay MchID is not configured. Please ensure a secret named `wechat-mch-id` exists and the backend has permission to access it.";
    console.error(`Configuration Error: ${errorMsg}`);
    return NextResponse.json({ error: `Payment provider configuration error: ${errorMsg}` }, { status: 503 });
  }
  if (!weChatApiKey) {
    const errorMsg = "WeChat Pay APIv3 Key is not configured. Please ensure a secret named `wechat-api-v3-key` exists and the backend has permission to access it.";
    console.error(`Configuration Error: ${errorMsg}`);
    return NextResponse.json({ error: `Payment provider configuration error: ${errorMsg}` }, { status: 503 });
  }
  
  console.log("All WeChat Pay secrets successfully retrieved. Proceeding to create mock order.");

  const out_trade_no = `MOCK_${randomUUID().replace(/-/g, '')}`;

  // This is where you would use the fetched secrets to make a real API call.
  // For now, we continue with the mock flow.
  const mock_code_url = "https://i.ibb.co/k3gfW2R/wechat-placeholder-qr.png";
  
  mockOrderStatusStore.set(out_trade_no, 'NOTPAY');
  console.log(`Mock order created: ${out_trade_no} for product: ${product.description}`);
  
  setTimeout(() => {
    mockOrderStatusStore.set(out_trade_no, 'SUCCESS');
    console.log(`Mock order ${out_trade_no} automatically marked as SUCCESS.`);
  }, 10000);

  return NextResponse.json({
    code_url: mock_code_url,
    out_trade_no: out_trade_no,
  });
}

// Endpoint to check the status of a mock order
export async function GET(request: Request) { // Changed from NextRequest for simplicity
  const { searchParams } = new URL(request.url);
  const out_trade_no = searchParams.get('out_trade_no');

  if (!out_trade_no) {
    return NextResponse.json({ error: 'Order ID (out_trade_no) is required.' }, { status: 400 });
  }

  const status = mockOrderStatusStore.get(out_trade_no) || 'NOTPAY';
  
  return NextResponse.json({
    trade_state: status,
  });
}
