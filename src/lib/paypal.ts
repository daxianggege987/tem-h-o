
import paypal from '@paypal/checkout-server-sdk';

/**
 * Creates and returns a PayPal client. This function now includes robust checks
 * to ensure environment variables are configured correctly, throwing clear errors
 * if they are missing.
 *
 * @returns {paypal.core.PayPalHttpClient} A configured PayPal client.
 * @throws {Error} If PayPal credentials are not found in the environment variables.
 */
function getClient() {
  // =================================================================================
  // PRODUCTION-READY PAYPAL CONFIGURATION
  // =================================================================================
  // This function now provides clear, actionable error messages if your production
  // environment is not configured correctly.

  const clientId = process.env.next_public_paypal_client_id;
  const clientSecret = process.env.paypal_client_secret;

  // --- Configuration Check ---
  // This check is crucial for debugging production issues.
  if (!clientId) {
    throw new Error(
      "CONFIGURATION ERROR: PayPal Client ID is missing. " +
      "Please go to your Firebase App Hosting backend settings, select the '环境' tab, " +
      "and add an environment variable with the '名称' (Name) `next_public_paypal_client_id` " +
      "and the '值' (Value) as your PayPal LIVE Client ID."
    );
  }

  if (!clientSecret) {
     throw new Error(
      "CONFIGURATION ERROR: PayPal Client Secret is missing. " +
      "Please go to your Firebase App Hosting backend settings, select the '环境' tab, " +
      "and add an environment variable with the '名称' (Name) `paypal_client_secret` " +
      "and the '值' (Value) as your PayPal LIVE Client Secret."
    );
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
