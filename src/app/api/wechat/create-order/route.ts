
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { Builder, parseStringPromise } from 'xml2js';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This simple in-memory cache will store secrets for a short duration
// to avoid fetching them from the API on every single request.
const secretCache = new Map<string, { value: string; expires: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache secrets for 5 minutes

// Helper function to get the latest version of a secret from Secret Manager
async function getSecretValue(secretName: string): Promise<string> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expires > Date.now()) {
    console.log(`[Secret Manager - WeChat] Returning cached value for ${secretName}.`);
    return cached.value;
  }

  console.log(`[Secret Manager - WeChat] Fetching new value for ${secretName}...`);
  const projectId = 'temporal-harmony-oracle';
  
  const client = new SecretManagerServiceClient({ projectId });
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();
    
    if (payload) {
      console.log(`[Secret Manager - WeChat] Successfully fetched and cached value for ${secretName}.`);
      secretCache.set(secretName, { value: payload, expires: Date.now() + CACHE_DURATION_MS });
      return payload;
    }

    console.warn(`[Secret Manager - WeChat] Warning: Secret ${secretName} has no payload.`);
    throw new Error(`Secret ${secretName} is empty.`);
  } catch (error) {
    console.error(`[Secret Manager - WeChat] CRITICAL: Failed to access secret ${secretName}. Error:`, error);
    throw error;
  }
}


// This function generates a random string of a given length.
function generateNonceStr(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charsLength = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}

// This function generates the 'sign' parameter according to WeChat Pay's V2 API rules,
// strictly adhering to the official documentation (RFC 1321 & UTF-8 encoding).
function generateSign(params: Record<string, any>, apiKey: string): string {
    // 1. Sort parameter keys by ASCII code
    const sortedKeys = Object.keys(params).sort();

    // 2. Filter out null/empty values and construct the key=value string
    const stringA = sortedKeys
        .filter(key => key !== 'sign' && params[key] !== undefined && params[key] !== null && String(params[key]) !== '')
        .map(key => `${key}=${String(params[key])}`)
        .join('&');
    
    // 3. Append the API key
    const stringSignTemp = `${stringA}&key=${apiKey}`;
    
    // 4. Perform MD5 hash with explicit UTF-8 encoding and convert to uppercase
    const sign = createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
    return sign;
}


const WECHAT_PAY_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

export async function POST(request: NextRequest) {
  try {
    const { product } = await request.json();

    if (!product || !product.price || !product.name) {
      return NextResponse.json({ error: 'Product information is required.' }, { status: 400 });
    }
    
    const [appId, mchId, apiKey] = await Promise.all([
        getSecretValue("wechat-app-id"),
        getSecretValue("wechat-mch-id"),
        getSecretValue("wechat-api-v3-key")
    ]);

    const clientIp = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const siteUrl = request.nextUrl.origin; 

    const orderParams: Record<string, any> = {
        appid: appId,
        mch_id: mchId,
        nonce_str: generateNonceStr(),
        body: product.name,
        out_trade_no: `prod_${product.id}_${Date.now()}`,
        total_fee: Math.round(parseFloat(product.price) * 100),
        spbill_create_ip: clientIp,
        notify_url: `${siteUrl}/api/wechat/notify`,
        trade_type: 'MWEB',
        scene_info: JSON.stringify({ 
            h5_info: {
                type: 'Wap',
                wap_url: siteUrl, 
                wap_name: 'Temporal Harmony Oracle'
            }
        })
    };

    const sign = generateSign(orderParams, apiKey);
    orderParams.sign = sign;
    
    const xmlBuilder = new Builder({ rootName: 'xml', headless: true, cdata: true });
    const xmlPayload = xmlBuilder.buildObject(orderParams);

    const response = await fetch(WECHAT_PAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        body: xmlPayload,
    });

    const xmlResponse = await response.text();
    const jsonResponse = await parseStringPromise(xmlResponse, { explicitArray: false, explicitRoot: false });

    if (jsonResponse.return_code === 'SUCCESS' && jsonResponse.result_code === 'SUCCESS') {
        return NextResponse.json({ mweb_url: jsonResponse.mweb_url });
    } else {
        console.error("WeChat Pay API Error:", jsonResponse);
        const errorMessage = jsonResponse.err_code_des || jsonResponse.return_msg || 'Unknown WeChat Pay API error';
        return NextResponse.json({ error: `微信支付接口错误: ${errorMessage}` }, { status: 500 });
    }
  } catch (error: any) {
      console.error("Error creating WeChat Pay order:", error);
      return NextResponse.json({ error: 'Failed to create WeChat payment order.' }, { status: 500 });
  }
}
