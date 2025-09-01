
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { Builder, parseStringPromise } from 'xml2js';

// --- START: Hardcoded credentials for absolute consistency ---
// These values are confirmed and required to be hardcoded to resolve signature issues.
const MOCK_WECHAT_APP_ID = "wx6b945975194be868";
const MOCK_WECHAT_MCH_ID = "1337450401";
const WECHAT_API_KEY = "LiGuang19820915Yanglili19820108A";
// --- END: Hardcoded credentials ---


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

// This function generates the 'sign' parameter according to WeChat Pay's V2 API rules.
// It uses a fixed, manually sorted parameter order to guarantee consistency, matching the
// official validation tool's output.
function generateSign(params: Record<string, any>, apiKey: string) {
    // 1. Define the exact, correct ASCII-sorted order of keys for signing.
    // This order has been confirmed by the official WeChat Pay signature validation tool.
    const sortedKeys = [
        'appid', 
        'body', 
        'mch_id', 
        'nonce_str', 
        'notify_url', 
        'out_trade_no', 
        'spbill_create_ip', 
        'total_fee', 
        'trade_type'
    ];

    // 2. Concatenate into a query string ("key1=value1&key2=value2...").
    // We only include parameters that have non-empty values.
    const stringA = sortedKeys
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .map(key => `${key}=${params[key]}`)
        .join('&');

    // 3. Append the API key.
    const stringSignTemp = `${stringA}&key=${apiKey}`;
    
    // Log the string to be signed for debugging. This is the string you can use in validation tools.
    console.log("[WeChat Pay Signing String]:", stringSignTemp);
    
    // 4. MD5 hash and convert to uppercase.
    return createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
}


const WECHAT_PAY_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

export async function POST(request: NextRequest) {
  const { product } = await request.json();

  if (!product || !product.name || !product.price) {
    return NextResponse.json({ error: 'Product information is required.' }, { status: 400 });
  }

  // Use the hardcoded values directly to ensure consistency.
  const weChatAppId = MOCK_WECHAT_APP_ID;
  const weChatMchId = MOCK_WECHAT_MCH_ID;
  
  if (!weChatAppId || !weChatMchId || !WECHAT_API_KEY) {
    console.error("WeChat Pay configuration is missing. Check the hardcoded credentials in the file.");
    return NextResponse.json({ error: 'WeChat Pay is not configured correctly.' }, { status: 503 });
  }

  const clientIp = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const siteUrl = request.nextUrl.origin; 

  // Step 1: Create an object with all parameters for the signature.
  const paramsForSigning: Record<string, any> = {
      appid: weChatAppId,
      mch_id: weChatMchId,
      nonce_str: generateNonceStr(),
      body: `Temporal Harmony Oracle - ${product.name}`, // Compliant body format
      out_trade_no: `prod_${product.id}_${Date.now()}`,
      total_fee: Math.round(parseFloat(product.price) * 100),
      spbill_create_ip: clientIp,
      notify_url: `${siteUrl}/api/wechat/notify`,
      trade_type: 'MWEB',
  };

  // Step 2: Generate the signature.
  const sign = generateSign(paramsForSigning, WECHAT_API_KEY);

  // Step 3: Create the final, complete parameter object for the XML body.
  const orderParams: Record<string, any> = {
      ...paramsForSigning,
      sign: sign,
      scene_info: JSON.stringify({ // scene_info does NOT participate in the signature.
          h5_info: {
              type: 'Wap',
              wap_url: siteUrl, // Dynamically get the site URL
              wap_name: 'Temporal Harmony Oracle'
          }
      })
  };

  const xmlBuilder = new Builder({ rootName: 'xml', headless: true, cdata: true });
  const xmlPayload = xmlBuilder.buildObject(orderParams);

  // Log the complete XML payload for validation with the official tool.
  console.log("--- WeChat Pay XML Payload for Validation ---");
  console.log(xmlPayload);
  console.log("-------------------------------------------");

  try {
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
