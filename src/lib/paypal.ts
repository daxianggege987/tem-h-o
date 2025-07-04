import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client.
 * This function is called within API routes. It now returns null if configuration is missing,
 * allowing the API route to handle the error gracefully with a proper JSON response.
 * @returns {paypal.core.PayPalHttpClient | null} A configured PayPal client or null if credentials are not set.
 */
function getClient() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("CRITICAL: PayPal client ID or secret is not defined in environment variables.");
        return null;
    }
    
    // This sample uses SandboxEnvironment. In production, use LiveEnvironment.
    const environment = process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    
    return new paypal.core.PayPalHttpClient(environment);
}

export default getClient;
