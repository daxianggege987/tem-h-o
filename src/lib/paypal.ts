
import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client configured for either Sandbox or Live environments.
 * This function is robust and handles configuration errors gracefully.
 *
 * @returns {paypal.core.PayPalHttpClient | null} A configured PayPal client or null if credentials are missing.
 */
function getClient() {
    try {
        // =================================================================================
        // HOW TO GO LIVE WITH REAL PAYMENTS
        // =================================================================================
        // To switch from test payments (Sandbox) to real payments (Live), you do NOT
        // need to change any code. You only need to update your environment variables
        // in the Firebase App Hosting console.
        //
        // STEP-BY-STEP GUIDE:
        // 1. Log in to your PayPal Developer Dashboard.
        // 2. Go to "My Apps & Credentials".
        // 3. IMPORTANT: Toggle the view from "Sandbox" to "LIVE" at the top of the page.
        // 4. Get your "Live" Client ID and Client Secret.
        // 5. In your Firebase Console, navigate to: App Hosting > Your Backend > 设置 (Settings).
        // 6. Click on the "环境" (Environment) tab. This is the correct place for secrets.
        // 7. Add or update the following two environment variables:
        //
        //    - Variable 1:
        //      Name: NEXT_PUBLIC_PAYPAL_CLIENT_ID
        //      Value: Paste your LIVE Client ID here.
        //
        //    - Variable 2:
        //      Name: PAYPAL_CLIENT_SECRET
        //      Value: Paste your LIVE Client Secret here. (Mark as "Secret" if option is available)
        //
        // 8. Click "保存" (Save) and redeploy your backend if prompted.
        //
        // That's it! The code below will automatically detect the production environment
        // and use your live credentials.
        // =================================================================================

        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error("CONFIGURATION ERROR: PayPal `NEXT_PUBLIC_PAYPAL_CLIENT_ID` or `PAYPAL_CLIENT_SECRET` is not defined in environment variables.");
            return null;
        }
        
        // This logic AUTOMATICALLY switches between Sandbox and Live environments.
        // When your app is deployed, NODE_ENV is 'production', so it uses LiveEnvironment.
        // For local development, it uses SandboxEnvironment.
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
