import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client.
 * This function is called within API routes to ensure that any configuration errors
 * are caught within the request-response cycle and returned as a proper JSON error.
 * @throws {Error} If PayPal environment variables are not set.
 */
function getClient() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("PayPal client ID or secret is not defined in environment variables.");
        // This error will be caught by the API route's try...catch block
        throw new Error("PayPal server credentials are not configured. Ensure PAYPAL_CLIENT_SECRET is set in environment variables.");
    }
    
    // This sample uses SandboxEnvironment. In production, use LiveEnvironment.
    const environment = process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    
    return new paypal.core.PayPalHttpClient(environment);
}

export default getClient;
