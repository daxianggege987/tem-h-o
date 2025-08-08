
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
        const { product, lang } = await request.json();

        if (!product || !product.id || !product.price || !product.name) {
            return NextResponse.json({ error: "Invalid product information provided." }, { status: 400 });
        }

        const out_trade_no = `oracle_${product.id}_${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        let returnUrlPath = '/';
        if (product.id.startsWith('vip')) {
            returnUrlPath = lang === 'zh-CN' ? '/vip202577661516' : '/en/vip202577661516';
        } else if (product.id.startsWith('source-code')) {
            returnUrlPath = lang === 'zh-CN' ? '/download' : '/en/download';
        } else {
            returnUrlPath = lang === 'zh-CN' ? '/reading' : '/en/reading';
        }

        const paramsToSign: Record<string, string> = {
            money: product.price,
            name: product.name,
            notify_url: `https://choosewhatnow.com/api/zpay/notify`,
            out_trade_no: out_trade_no,
            pid: ZPAY_PID,
            return_url: `https://choosewhatnow.com${returnUrlPath}`,
            type: 'alipay',
        };

        const sortedKeys = Object.keys(paramsToSign).sort();

        const signString = sortedKeys
            .map(key => `${key}=${paramsToSign[key]}`)
            .join('&');

        const finalStringToHash = signString + ZPAY_KEY;
        const sign = createHash('md5').update(finalStringToHash).digest('hex').toLowerCase();
        
        const responsePayload = {
            ...paramsToSign,
            sign: sign,
            sign_type: 'MD5',
        };

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error("Error creating Z-Pay order:", error);
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
