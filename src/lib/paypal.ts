import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client. This function now includes robust checks
 * to ensure environment variables are configured correctly.
 *
 * @returns {paypal.core.PayPalHttpClient} A configured PayPal client.
 * @throws {Error} If PayPal credentials are not found in the environment variables.
 */
function getClient() {
  // `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is loaded from `apphosting.yaml`.
  // `PAYPAL_CLIENT_SECRET` is loaded from the Firebase Console's environment variable settings
  // for the production environment.
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // --- Configuration Check ---
  if (!clientId || !clientSecret) {
    const errorMessage = 
        "CONFIGURATION ERROR: PayPal credentials were not found. " +
        "Ensure 'NEXT_PUBLIC_PAYPAL_CLIENT_ID' is in apphosting.yaml and " +
        "that 'PAYPAL_CLIENT_SECRET' is set as an environment variable for your backend in the Firebase Console UI.";
    
    console.error(`CRITICAL: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // --- Environment Selection ---
  // This logic AUTOMATICALLY switches between Sandbox and Live environments.
  const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  
  console.log(`PayPal client initialized for ${process.env.NODE_ENV === 'production' ? 'LIVE' : 'SANDBOX'} environment.`);
  
  return new paypal.core.PayPalHttpClient(environment);
}

export default getClient;
