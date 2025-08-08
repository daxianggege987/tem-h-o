
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
    // --- TEMPORARY CREDENTIALS FOR WEB-BASED DEVELOPMENT ENVIRONMENT ---
    // IMPORTANT: For production, these should be moved to a secure vault
    // like Google Secret Manager and fetched at runtime.
    const ZPAY_PID = "2025080213180664";
    const ZPAY_KEY = "VrhOu7KntoIZbV8xFuNJWSIWjjuum6zg";
    
    if (!ZPAY_PID || !ZPAY_KEY) {
        return NextResponse.json({ error: "Payment provider is not configured. Missing PID or Key." }, { status: 503 });
    }

    try {
        const { lang } = await request.json();

        const out_trade_no = `oracle_${Date.now()}${Math.floor(Math.random() * 1000)}`;
        // Use language to construct the correct return URL
        const returnUrlPath = lang === 'zh-CN' ? '/reading' : '/en/reading';

        // --- CORRECT SIGNATURE LOGIC BASED ON OFFICIAL DOCUMENTATION ---
        
        // 1. Create a dictionary with only the parameters that need to be signed.
        // To ensure stability, we are hardcoding the 'money' and 'name' values on the backend.
        const paramsToSign: Record<string, string> = {
            money: "9.9",
            name: "UnlockReading", // Using a clean, no-space string.
            notify_url: `https://choosewhatnow.com/api/zpay/notify`,
            out_trade_no: out_trade_no,
            pid: ZPAY_PID,
            return_url: `https://choosewhatnow.com${returnUrlPath}`,
            type: 'alipay',
        };

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

        // Construct the final payload to be sent to Z-Pay, including the signature
        const responsePayload = {
            ...paramsToSign, // Use all signed parameters for the final request
            sign: sign,
            sign_type: 'MD5',
        };

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error("Error creating Z-Pay order:", error);
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
