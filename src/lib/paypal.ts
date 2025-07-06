import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client configured for either Sandbox or Live environments.
 * This function is robust and handles configuration errors gracefully.
 *
 * @returns {paypal.core.PayPalHttpClient | null} A configured PayPal client or null if credentials are missing.
 */
function getClient() {
    try {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error("CONFIGURATION ERROR: PayPal `NEXT_PUBLIC_PAYPAL_CLIENT_ID` or `PAYPAL_CLIENT_SECRET` is not defined in environment variables.");
            return null;
        }
        
        // --- PRODUCTION vs. SANDBOX Environment ---
        // This is the crucial part for going live.
        // When your application is deployed to a production environment (like Firebase App Hosting),
        // the `NODE_ENV` environment variable will automatically be set to 'production'.
        // This code detects that and switches to PayPal's LiveEnvironment.
        // For local development (`npm run dev`), `NODE_ENV` is 'development', so it uses the SandboxEnvironment.
        const environment = process.env.NODE_ENV === 'production'
          ? new paypal.core.LiveEnvironment(clientId, clientSecret)
          : new paypal.core.SandboxEnvironment(clientId, clientSecret);
        
        console.log(`PayPal client initialized for ${process.env.NODE_ENV === 'production' ? 'LIVE' : 'SANDBOX'} environment.`);
        
        return new paypal.core.PayPalHttpClient(environment);
    } catch (error) {
        console.error("CRITICAL: Failed to create PayPal HTTP client.", error);
        return null;
    }
}

export default getClient;
