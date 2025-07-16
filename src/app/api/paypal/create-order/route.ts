
import paypal from "@paypal/checkout-server-sdk";
import { NextResponse } from 'next/server';

const clientId = process.env.PAYPAL_CLIENT_ID || "";
const clientSecret = process.env.PAYPAL_SECRET || "";

// This sample uses SandboxEnvironment. In production, use LiveEnvironment.
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request: Request) {
    if (!clientId || !clientSecret) {
        console.error("PayPal client ID or secret is not configured in environment variables.");
        return NextResponse.json({ error: "Payment provider is not configured correctly." }, { status: 503 });
    }

    try {
        const { product } = await request.json();

        if (!product || !product.price || !product.description) {
            return NextResponse.json({ error: "Product information is required." }, { status: 400 });
        }

        const paypalRequest = new paypal.orders.OrdersCreateRequest();
        paypalRequest.prefer("return=representation");
        paypalRequest.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: product.price,
                    },
                    description: product.description,
                },
            ],
        });

        const order = await client.execute(paypalRequest);
        
        return NextResponse.json({ id: order.result.id });

    } catch (err: any) {
        console.error("Error creating PayPal order:", err);
        // Check for specific PayPal API errors
        if (err.statusCode) {
            let errorMessage = "Failed to create PayPal order.";
            try {
                const errorDetails = JSON.parse(err.message);
                if (errorDetails.name === 'AUTHENTICATION_FAILURE') {
                    errorMessage = "PayPal client authentication failed. Please check your credentials.";
                } else if (errorDetails.message) {
                    errorMessage = errorDetails.message;
                }
            } catch (e) {
                // Ignore if err.message is not JSON
            }
             return NextResponse.json({ error: errorMessage }, { status: err.statusCode });
        }
        
        return NextResponse.json({ error: "An internal server error occurred while creating the PayPal order." }, { status: 500 });
    }
}

