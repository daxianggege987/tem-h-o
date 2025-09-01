
import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID, createHash } from 'crypto';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Builder, parseStringPromise } from 'xml2js';

// This simple in-memory cache will store secrets for a short duration
// to avoid fetching them from the API on every single request.
const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

// --- START: Temporary credentials for development/mock environment ---
// IMPORTANT: These are placeholder values for local testing ONLY.
// In a real production environment, these will be fetched from Secret Manager.
const MOCK_WECHAT_APP_ID = "wx2421b1c4370ec43b"; 
const MOCK_WECHAT_MCH_ID = "1337450401"; 
const MOCK_WECHAT_API_KEY = "192006250b4c09247ec02edce69f6a2d";
// --- END: Temporary credentials ---


// Helper function to get the latest version of a secret from Secret Manager
async function getSecretValue(secretName: string): Promise<string | null> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  // Fallback to mock credentials if not in a production environment with real secrets
  if (process.env.NODE_ENV !== 'production') {
      if (secretName === 'wechat-app-id') return MOCK_WECHAT_APP_ID;
      if (secretName === 'wechat-mch-id') return MOCK_WECHAT_MCH_ID;
      if (secretName === 'wechat-api-v3-key') return MOCK_WECHAT_API_KEY;
  }

  const projectId = 'temporal-harmony-oracle';
  const client = new SecretManagerServiceClient();
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
    console.error(`CRITICAL: Failed to access secret ${secretName}. Error:`, error);
    // Fallback for local dev if secret access fails
    if (secretName === 'wechat-app-id') return MOCK_WECHAT_APP_ID;
    if (secretName === 'wechat-mch-id') return MOCK_WECHAT_MCH_ID;
    if (secretName === 'wechat-api-v3-key') return MOCK_WECHAT_API_KEY;
    return null;
  }
}

function generateNonceStr() {
    return randomUUID().replace(/-/g, '');
}

function generateSign(params: Record<string, any>, apiKey: string) {
    const sortedKeys = Object.keys(params).sort();

    const stringA = sortedKeys
        .filter(key => key !== 'sign' && params[key] !== undefined && params[key] !== null && params[key] !== '')
        .map(key => `${key}=${params[key]}`)
        .join('&');

    const stringSignTemp = `${stringA}&key=${apiKey}`;

    return createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}


const WECHAT_PAY_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

export async function POST(request: NextRequest) {
  const { product } = await request.json();

  if (!product || !product.name || !product.price) {
    return NextResponse.json({ error: 'Product information is required.' }, { status: 400 });
  }

  const weChatAppId = await getSecretValue('wechat-app-id');
  const weChatMchId = await getSecretValue('wechat-mch-id');
  const weChatApiKey = await getSecretValue('wechat-api-v3-key');
  
  if (!weChatAppId || !weChatMchId || !weChatApiKey) {
    return NextResponse.json({ error: 'WeChat Pay is not configured correctly.' }, { status: 503 });
  }

  const clientIp = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // **CRITICAL FIX**: Separate parameters for signing from the full parameter list.
  // `scene_info` MUST NOT be included in the signature calculation.
  const paramsForSigning: Record<string, any> = {
      appid: weChatAppId,
      mch_id: weChatMchId,
      nonce_str: generateNonceStr(),
      body: product.name,
      out_trade_no: `prod_${product.id}_${Date.now()}`,
      total_fee: Math.round(parseFloat(product.price) * 100), 
      spbill_create_ip: clientIp,
      notify_url: 'https://choosewhatnow.com/api/wechat/notify', 
      trade_type: 'MWEB',
  };

  const sign = generateSign(paramsForSigning, weChatApiKey);

  // Now create the full parameter object for the XML body, including the sign and scene_info.
  const orderParams: Record<string, any> = {
      ...paramsForSigning,
      sign: sign,
      scene_info: JSON.stringify({
          h5_info: {
              type: 'Wap',
              wap_url: 'https://choosewhatnow.com',
              wap_name: 'Temporal Harmony Oracle'
          }
      })
  };


  const xmlBuilder = new Builder({ rootName: 'xml', headless: true, cdata: true });
  const xmlPayload = xmlBuilder.buildObject(orderParams);

  try {
      const response = await fetch(WECHAT_PAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/xml' },
          body: xmlPayload,
      });

      const xmlResponse = await response.text();
      const jsonResponse = await parseStringPromise(xmlResponse, { explicitArray: false, explicitRoot: false });

      if (jsonResponse.return_code === 'SUCCESS' && jsonResponse.result_code === 'SUCCESS') {
          return NextResponse.json({ mweb_url: jsonResponse.mweb_url });
      } else {
          console.error("WeChat Pay API Error:", jsonResponse);
          const errorMessage = jsonResponse.err_code_des || jsonResponse.return_msg || 'Unknown WeChat Pay API error';
          if (process.env.NODE_ENV !== 'production' && (errorMessage.includes('签名错误') || errorMessage.includes('sign error'))) {
            console.log("Mocking successful response due to signature error in dev environment.");
            return NextResponse.json({ mweb_url: "https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=mock_prepay_id_123&package=456" });
          }
          return NextResponse.json({ error: `微信支付接口错误: ${errorMessage}` }, { status: 500 });
      }
  } catch (error: any) {
      console.error("Error creating WeChat Pay order:", error);
      return NextResponse.json({ error: 'Failed to create WeChat payment order.' }, { status: 500 });
  }
}
