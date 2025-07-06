
import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client. This function now includes robust checks
 * to ensure environment variables are configured correctly via apphosting.yaml.
 *
 * @returns {paypal.core.PayPalHttpClient} A configured PayPal client.
 * @throws {Error} If PayPal credentials are not found in the environment variables.
 */
function getClient() {
  // =================================================================================
  // PRODUCTION-READY PAYPAL CONFIGURATION
  // =================================================================================
  // This function reads credentials from environment variables set in `apphosting.yaml`.

  const clientId = process.env.next_public_paypal_client_id;
  const clientSecret = process.env.paypal_client_secret;

  // --- Configuration Check ---
  // This check is crucial for debugging production issues. It now points to the correct configuration file.
  if (!clientId || !clientSecret) {
    const errorMessage = 
        "CONFIGURATION ERROR: PayPal credentials are not configured for this environment. " +
        "Please ensure 'next_public_paypal_client_id' and 'paypal_client_secret' are correctly " +
        "defined in your 'apphosting.yaml' file and that the secret exists in Google Cloud Secret Manager.";
    
    console.error(`CRITICAL: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // --- Environment Selection ---
  // This logic AUTOMATICALLY switches between Sandbox and Live environments.
  // When your app is deployed, NODE_ENV is 'production', so it uses LiveEnvironment.
  const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  
  console.log(`PayPal client initialized for ${process.env.NODE_ENV === 'production' ? 'LIVE' : 'SANDBOX'} environment.`);
  
  return new paypal.core.PayPalHttpClient(environment);
}

export default getClient;
