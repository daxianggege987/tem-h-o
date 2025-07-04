import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client.
 * This function is now fully error-proof. It will either return a valid client
 * or null if any error occurs during instantiation, preventing server crashes.
 * @returns {paypal.core.PayPalHttpClient | null} A configured PayPal client or null if any error occurs.
 */
function getClient() {
    try {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error("CONFIGURATION ERROR: PayPal client ID or secret is not defined in environment variables.");
            return null;
        }
        
        // This sample uses SandboxEnvironment. In production, use LiveEnvironment.
        const environment = process.env.NODE_ENV === 'production'
          ? new paypal.core.LiveEnvironment(clientId, clientSecret)
          : new paypal.core.SandboxEnvironment(clientId, clientSecret);
        
        return new paypal.core.PayPalHttpClient(environment);
    } catch (error) {
        // Catch any error during client creation (e.g., malformed credentials)
        console.error("CRITICAL: Failed to create PayPal HTTP client.", error);
        return null;
    }
}

export default getClient;
