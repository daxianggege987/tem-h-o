// IMPORTANT: This is a placeholder for a real WeChat Pay integration.
// In a real application, you would use the WeChat Pay SDK to communicate
// with their API, generate a real order, and return a real QR code URL.
// Credentials are now securely managed via Secret Manager.

import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

// A simple in-memory store to simulate order status.
// In a real app, use a database like Firestore.
const mockOrderStatusStore = new Map<string, 'NOTPAY' | 'SUCCESS'>();

// Helper function to check for required secrets and return a specific error if any are missing.
function checkWeChatConfig(): string | null {
  // These environment variables are automatically populated by App Hosting
  // when the secrets are configured in apphosting.yaml.
  if (!process.env.WECHAT_APP_ID) {
    return 'WeChat Pay AppID is not configured. Please ensure a secret named `wechat-app-id` exists and the backend has permission to access it.';
  }
  if (!process.env.WECHAT_MCH_ID) {
    return 'WeChat Pay MchID is not configured. Please ensure a secret named `wechat-mch-id` exists and the backend has permission to access it.';
  }
  if (!process.env.WECHAT_API_V3_KEY) {
    return 'WeChat Pay APIv3 Key is not configured. Please ensure a secret named `wechat-api-v3-key` exists and the backend has permission to access it.';
  }
  return null;
}

// Endpoint to create a mock WeChat Pay order
export async function POST(request: Request) {
  const { product } = await request.json();

  if (!product || !product.description || !product.price) {
    return NextResponse.json({ error: 'Product information is required.' }, { status: 400 });
  }

  // Check for secrets to ensure backend is configured.
  const configError = checkWeChatConfig();
  if (configError) {
     console.error(`WeChat Pay Configuration Error: ${configError}`);
     return NextResponse.json({ error: `Payment provider configuration error: ${configError}` }, { status: 503 });
  }

  const out_trade_no = `MOCK_${randomUUID().replace(/-/g, '')}`;

  // In a real implementation:
  // 1. You would call the WeChat Pay API here with the product details and your credentials.
  //    - Endpoint: https://api.mch.weixin.qq.com/v3/pay/transactions/native
  //    - You'd need to handle authentication (signing requests).
  // 2. The API would return a `code_url`, which is the actual URL for the QR code.

  // For this mock, we'll use a placeholder QR code URL and simulate the process.
  const mock_code_url = "https://i.ibb.co/k3gfW2R/wechat-placeholder-qr.png";
  
  // Initialize the order status as 'NOTPAY'
  mockOrderStatusStore.set(out_trade_no, 'NOTPAY');

  console.log(`Mock order created: ${out_trade_no} for product: ${product.description}`);
  
  // Simulate payment success after 10 seconds for demonstration
  setTimeout(() => {
    mockOrderStatusStore.set(out_trade_no, 'SUCCESS');
    console.log(`Mock order ${out_trade_no} automatically marked as SUCCESS.`);
  }, 10000); // 10 seconds

  return NextResponse.json({
    code_url: mock_code_url, // This would be the real URL from WeChat
    out_trade_no: out_trade_no, // The unique order ID to check status
  });
}

// Endpoint to check the status of a mock order
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const out_trade_no = searchParams.get('out_trade_no');

  if (!out_trade_no) {
    return NextResponse.json({ error: 'Order ID (out_trade_no) is required.' }, { status: 400 });
  }

  const status = mockOrderStatusStore.get(out_trade_no) || 'NOTPAY';

  // In a real implementation, you would query the WeChat Pay API for the order status.
  //   - Endpoint: https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/{out_trade_no}
  
  return NextResponse.json({
    trade_state: status, // e.g., 'SUCCESS', 'NOTPAY', 'CLOSED', etc.
  });
}
