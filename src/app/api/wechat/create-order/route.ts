
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { Builder, parseStringPromise } from 'xml2js';

// --- START: Hardcoded credentials for absolute consistency ---
// These values are based on the official WeChat Pay tool's successful example.
const WECHAT_APP_ID = "wx6b945975194be868";
const WECHAT_MCH_ID = "1337450401";
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
// It correctly sorts parameters by their ASCII-sorted keys.
function generateSign(params: Record<string, any>): string {
    // 1. Get all the keys from the params object
    const sortedKeys = Object.keys(params).sort();

    // 2. Concatenate into a query string ("key1=value1&key2=value2...").
    // We only include parameters that have non-empty values.
    // CRITICAL FIX: Ensure all values are treated as strings before concatenation.
    const stringA = sortedKeys
        .filter(key => params[key] !== null && params[key] !== undefined && String(params[key]) !== '')
        .map(key => `${key}=${String(params[key])}`) // Explicitly cast value to String
        .join('&');

    // 3. Append the API key.
    const stringSignTemp = `${stringA}&key=${WECHAT_API_KEY}`;
    
    // Log the string to be signed for debugging. This is the string you can use in validation tools.
    console.log("[WeChat Pay Signing String]:", stringSignTemp);
    
    // 4. MD5 hash and convert to uppercase using Node.js's built-in crypto library.
    const sign = createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
    console.log("[Generated Signature]:", sign); // Log the generated signature for verification.
    return sign;
}


const WECHAT_PAY_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

export async function POST(request: NextRequest) {
  const { product } = await request.json();

  if (!product || !product.price) {
    return NextResponse.json({ error: 'Product information is required.' }, { status: 400 });
  }
  
  const clientIp = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const siteUrl = request.nextUrl.origin; 

  // Step 1: Create an object with all parameters for the signature.
  // CRITICAL: The 'body' is now hardcoded to match the official example for testing.
  const paramsForSigning: Record<string, any> = {
      appid: WECHAT_APP_ID,
      mch_id: WECHAT_MCH_ID,
      nonce_str: generateNonceStr(),
      body: "腾讯充值中心-会员（升级）", // HARDCODED BODY TO MATCH OFFICIAL EXAMPLE
      out_trade_no: `prod_${product.id}_${Date.now()}`,
      total_fee: Math.round(parseFloat(product.price) * 100),
      spbill_create_ip: clientIp,
      notify_url: `${siteUrl}/api/wechat/notify`,
      trade_type: 'MWEB',
  };

  // Step 2: Generate the signature using the corrected logic.
  const sign = generateSign(paramsForSigning);

  // Step 3: Create the final, complete parameter object for the XML body.
  const orderParams: Record<string, any> = {
      ...paramsForSigning,
      sign: sign,
  };
  
  // Note: scene_info is not part of the signature calculation. It's added to the final XML.
  const finalXmlObject = {
      xml: {
        ...orderParams,
        scene_info: JSON.stringify({ 
            h5_info: {
                type: 'Wap',
                wap_url: siteUrl, 
                wap_name: 'Temporal Harmony Oracle'
            }
        })
      }
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
