
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
    // --- TEMPORARY CREDENTIALS FOR WEB-BASED DEVELOPMENT ENVIRONMENT ---
    const ZPAY_PID = "2025080213180664";
    const ZPAY_KEY = "VrhOu7KntoIZbV8xFuNJWSIWjjuum6zg";
    
    if (!ZPAY_PID || !ZPAY_KEY) {
        return NextResponse.json({ error: "Payment provider is not configured. Missing PID or Key." }, { status: 503 });
    }

    try {
        const { product, lang } = await request.json();

        if (!product || !product.price || !product.name) {
            return NextResponse.json({ error: "Product information is missing." }, { status: 400 });
        }

        const out_trade_no = `oracle_${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const returnUrlPath = lang === 'zh-CN' ? '/reading' : '/en/reading';

        // All parameters to be sent to Z-Pay
        const params: Record<string, string> = {
            pid: ZPAY_PID,
            money: parseFloat(product.price).toFixed(2),
            name: product.name,
            notify_url: `https://choosewhatnow.com/api/zpay/notify`,
            out_trade_no: out_trade_no,
            return_url: `https://choosewhatnow.com${returnUrlPath}`,
            type: 'alipay',
            sitename: "Temporal Harmony Oracle",
        };

        // --- CORRECT SIGNATURE LOGIC BASED ON OFFICIAL DOCUMENTATION ---
        
        // 1. Filter out parameters that should not be signed (`sign`, `sign_type`, empty values)
        const paramsToSign = { ...params };

        // 2. Sort the keys alphabetically (ASCII a-z)
        const sortedKeys = Object.keys(paramsToSign).sort();

        // 3. Concatenate into a URL query string
        const signString = sortedKeys
            .map(key => `${key}=${paramsToSign[key]}`)
            .join('&');

        // 4. Append the secret KEY and calculate MD5 hash (lowercase)
        const finalStringToHash = signString + ZPAY_KEY;
        const sign = createHash('md5').update(finalStringToHash).digest('hex').toLowerCase();
        
        // --- END CORRECT SIGNATURE LOGIC ---

        // Construct the final payload to be sent to Z-Pay
        const responsePayload = {
            ...params,
            sign: sign,
            sign_type: 'MD5',
        };

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error("Error creating Z-Pay order:", error);
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
