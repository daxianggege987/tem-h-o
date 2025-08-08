
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

        // ** FINAL CORRECTED SIGNATURE LOGIC - Based on user-provided example URL **
        // The key insight is that parameters are likely NOT sorted alphabetically,
        // but rather appended in a specific, fixed order before hashing.
        
        const money = parseFloat(product.price).toFixed(2);
        const name = product.name;
        const notify_url = `https://choosewhatnow.com/api/zpay/notify`;
        const return_url = `https://choosewhatnow.com${returnUrlPath}`;
        const type = 'alipay';

        // Concatenate in a fixed order, which is a common pattern if alphabetical sort fails.
        const signString = `money=${money}&name=${name}&notify_url=${notify_url}&out_trade_no=${out_trade_no}&pid=${ZPAY_PID}&return_url=${return_url}&type=${type}${ZPAY_KEY}`;
        
        const sign = createHash('md5').update(signString).digest('hex');
        
        // ** END CORRECT SIGNATURE LOGIC **

        // Construct the payload to be sent to Z-Pay or returned to the client
        const responsePayload = {
            pid: ZPAY_PID,
            money: money,
            notify_url: notify_url,
            out_trade_no: out_trade_no,
            return_url: return_url,
            type: type,
            sitename: "Temporal Harmony Oracle", // This seems to be for display, not signing
            name: name,
            sign: sign,
            sign_type: 'MD5',
        };

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error("Error creating Z-Pay order:", error);
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
