
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import getClient from '@/lib/paypal';

export async function POST(request: Request) {
  try {
    // getClient() can now throw a configuration error, which will be caught below.
    const client = getClient();
    
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
    // The error could be a configuration error from getClient() or a PayPal API error.
    const errorMessage = err.message || 'An unknown error occurred.';
    // If it's a config error, the status code should be 500 (Internal Server Error)
    return NextResponse.json({ error: `Failed to create order: ${errorMessage}` }, { status: 500 });
  }
}
