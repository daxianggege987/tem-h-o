
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import client from '@/lib/paypal';

export async function POST(request: Request) {
  try {
    const { product } = await request.json();
    
    if (!product || !product.price || !product.description) {
        return NextResponse.json({ error: 'Product information is missing.' }, { status: 400 });
    }

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer("return=representation");
    paypalRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: product.description,
          amount: {
            currency_code: 'USD',
            value: product.price, // e.g. '1.00'
          },
        },
      ],
    });

    const order = await client.execute(paypalRequest);
    
    return NextResponse.json({ id: order.result.id });
  } catch (err: any) {
    console.error("Failed to create PayPal order:", err);
    const errorMessage = err.message || 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to create order: ${errorMessage}` }, { status: 500 });
  }
}
