
import paypal from '@paypal/checkout-server-sdk';

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    throw new Error("PayPal client ID or secret is not defined in environment variables.");
}

// This sample uses SandboxEnvironment. In production, use LiveEnvironment.
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(clientId, clientSecret)
  : new paypal.core.SandboxEnvironment(clientId, clientSecret);

const client = new paypal.core.PayPalHttpClient(environment);

export default client;
