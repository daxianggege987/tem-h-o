
import { NextResponse, type NextRequest } from 'next/server';
import { createHash, createSign, randomBytes } from 'crypto';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This simple in-memory cache will store secrets for a short duration
// to avoid fetching them from the API on every single request.
const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

// Helper function to get the latest version of a secret from Secret Manager
async function getSecretValue(secretName: string): Promise<string> {
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

    throw new Error(`Secret ${secretName} is empty or could not be retrieved.`);
  } catch (error) {
    console.error(`CRITICAL: Failed to access secret ${secretName}. Error:`, error);
    throw error;
  }
}

// Generates a random nonce string
function generateNonceStr(): string {
    return randomBytes(16).toString('hex');
}

/**
 * Generates a signature for WeChat Pay API v3.
 * @param {string} method - The HTTP method (e.g., 'POST', 'GET').
 * @param {string} url - The URL path of the request (e.g., '/v3/pay/transactions/jsapi').
 * @param {number} timestamp - The current timestamp in seconds.
 * @param {string} nonceStr - The random nonce string.
 * @param {string} body - The JSON string of the request body.
 * @param {string} privateKey - The merchant's private key PEM string.
 * @returns {string} The Base64 encoded signature.
 */
function generateV3Sign(method: string, url: string, timestamp: number, nonceStr: string, body: string, privateKey: string): string {
    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
    const signer = createSign('RSA-SHA256');
    signer.update(message);
    return signer.sign(privateKey, 'base64');
}

const WECHAT_PAY_V3_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
const WECHAT_PAY_V3_H5_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/h5';


export async function POST(request: NextRequest) {
  try {
    const { product, paymentType } = await request.json();

    if (!product || !product.price || !product.name) {
      return NextResponse.json({ error: 'Product information is required.' }, { status: 400 });
    }
    
    const [appId, mchId, apiKeyV3, privateKey, serialNo] = await Promise.all([
        getSecretValue("wechat-app-id"),
        getSecretValue("wechat-mch-id"),
        getSecretValue("wechat-api-v3-key"),
        getSecretValue("wechat-private-key"),
        getSecretValue("wechat-serial-no")
    ]);

    const siteUrl = request.nextUrl.origin; 
    const isH5 = paymentType === 'MWEB';

    const orderParams = {
        appid: appId,
        mchid: mchId,
        description: product.name,
        out_trade_no: `prod_${product.id}_${Date.now()}`,
        notify_url: `${siteUrl}/api/wechat/notify-v3`, // Use a new endpoint for V3 notifications
        amount: {
            total: Math.round(parseFloat(product.price) * 100),
            currency: 'CNY'
        },
        ...(isH5 && {
          scene_info: {
            payer_client_ip: request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1',
            h5_info: {
              type: 'Wap',
            }
          }
        })
    };

    const requestBody = JSON.stringify(orderParams);
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = generateNonceStr();
    const apiUrlPath = isH5 ? new URL(WECHAT_PAY_V3_H5_URL).pathname : new URL(WECHAT_PAY_V3_URL).pathname;

    const signature = generateV3Sign('POST', apiUrlPath, timestamp, nonceStr, requestBody, privateKey);

    const authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`;
    
    const response = await fetch(isH5 ? WECHAT_PAY_V3_H5_URL : WECHAT_PAY_V3_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authorization,
            'Wechatpay-Serial': serialNo, // Required for platform certificate validation
        },
        body: requestBody,
    });

    const jsonResponse = await response.json();

    if (response.ok && (jsonResponse.prepay_id || jsonResponse.h5_url)) {
        if (isH5) {
          return NextResponse.json({ h5_url: jsonResponse.h5_url });
        }

        // For JSAPI, generate frontend parameters
        const prepayId = jsonResponse.prepay_id;
        const frontEndTimestamp = String(Math.floor(Date.now() / 1000));
        const frontEndNonceStr = generateNonceStr();
        const packageStr = `prepay_id=${prepayId}`;
        
        const frontEndMessage = `${appId}\n${frontEndTimestamp}\n${frontEndNonceStr}\n${packageStr}\n`;
        const frontEndSigner = createSign('RSA-SHA256');
        frontEndSigner.update(frontEndMessage);
        const paySign = frontEndSigner.sign(privateKey, 'base64');
        
        return NextResponse.json({
            appId: appId,
            timeStamp: frontEndTimestamp,
            nonceStr: frontEndNonceStr,
            package: packageStr,
            signType: 'RSA',
            paySign: paySign
        });

    } else {
        console.error("WeChat Pay V3 API Error:", jsonResponse);
        const errorMessage = jsonResponse.message || 'Unknown WeChat Pay V3 API error';
        return NextResponse.json({ error: `微信支付接口错误: ${errorMessage}` }, { status: 500 });
    }
  } catch (error: any) {
      console.error("Error creating WeChat Pay V3 order:", error);
      return NextResponse.json({ error: 'Failed to create WeChat payment order.' }, { status: 500 });
  }
}
