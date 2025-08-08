
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
    // --- TEMPORARY CREDENTIALS FOR WEB-BASED DEVELOPMENT ENVIRONMENT ---
    const ZPAY_PID_TEMP = "2025080213180664";
    const ZPAY_KEY_TEMP = "VrhOu7KntoIZbV8xFuNJWSIWjjuum6zg";
    
    const ZPAY_PID: string | null = ZPAY_PID_TEMP;
    const ZPAY_KEY: string | null = ZPAY_KEY_TEMP;

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

        // ** CORRECTED SIGNATURE GENERATION LOGIC - Following the official Z-Pay Node.js demo **
        // All parameters that need to be signed.
        const paramsForSign: { [key: string]: string | number } = {
            pid: ZPAY_PID,
            money: parseFloat(product.price).toFixed(2),
            notify_url: `https://choosewhatnow.com/api/zpay/notify`,
            out_trade_no: out_trade_no,
            return_url: `https://choosewhatnow.com${returnUrlPath}`,
            type: 'alipay', // CORRECTED to alipay
            sitename: "Temporal Harmony Oracle",
            name: product.name,
        };

        // 1. Filter out empty values, 'sign', and 'sign_type'.
        const filteredParams: { [key: string]: string } = {};
        for (const key in paramsForSign) {
            const value = paramsForSign[key as keyof typeof paramsForSign];
            if (value !== null && value !== '' && key !== 'sign' && key !== 'sign_type') {
                filteredParams[key] = String(value);
            }
        }
        
        // 2. Sort keys alphabetically.
        const sortedKeys = Object.keys(filteredParams).sort();
        
        // 3. Concatenate into a query string.
        const signString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&');

        // 4. Append the secret key and create MD5 hash.
        const sign = createHash('md5').update(signString + ZPAY_KEY).digest('hex');
        
        // ** END CORRECT SIGNATURE LOGIC **

        // Add the non-signed parameters back for the final request
        const responsePayload = {
            ...paramsForSign,
            sign: sign,
            sign_type: 'MD5',
        };

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error("Error creating Z-Pay order:", error);
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
