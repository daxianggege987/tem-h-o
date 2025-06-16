
// IMPORTANT: This API route now attempts to integrate with a specific third-party SMS provider.
// You MUST:
// 1. Replace console logging of OTP with a secure OTP storage mechanism (e.g., Firestore, Redis).
// 2. Move credentials (SMS_API_URL, SMS_USERNAME, SMS_PASSWORD) to environment variables for security.
// 3. Verify the exact API request structure (JSON fields, headers) required by your SMS provider.
// 4. Implement robust error handling and logging for the SMS provider's response.

import { type NextRequest, NextResponse } from 'next/server';

// Helper function to generate a simple 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configuration for your third-party SMS provider
// TODO: Move these to environment variables (e.g., process.env.SMS_API_URL)
const SMS_API_URL_1 = 'http://61.147.98.117:9001'; // Endpoint adjusted
const SMS_API_URL_2 = 'http://61.147.98.117:9015'; // Endpoint adjusted
const SMS_USERNAME = '13181914554';
const SMS_RAW_PASSWORD = '474466615';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body; // Expecting E.164 format from client, e.g., +8613xxxxxxxxx

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Generate OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // 2. Store OTP (CRITICAL: Replace with secure storage like Firestore or Redis)
    // For demonstration, we'll log it. DO NOT use this in production.
    console.log(`OTP for ${phoneNumber}: ${otp} (Expires: ${otpExpiry.toISOString()})`);
    // Example: await saveOtpToDatabase(phoneNumber, otp, otpExpiry);
    // You would typically store: { phoneNumber, otp, expiry, verified: false }

    // 3. Send OTP via your third-party SMS provider
    const encodedPassword = Buffer.from(SMS_RAW_PASSWORD).toString('base64');
    const message = `【您的应用名称】您的验证码是：${otp}。请勿泄露给他人。`; // Customize your message

    // Prepare the request payload for the SMS provider
    // This is a common structure, adjust if your provider requires something different
    // (e.g., form-urlencoded, different field names)
    const smsPayload = {
      username: SMS_USERNAME,
      password: encodedPassword,
      mobile: phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber, // Provider might expect number without '+'
      content: message,
      // Add any other required parameters by your SMS provider (e.g., templateId, signName)
    };

    let smsResponse;
    try {
      smsResponse = await fetch(SMS_API_URL_1, { // Using the first URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Or 'application/x-www-form-urlencoded' if required
        },
        body: JSON.stringify(smsPayload),
      });
    } catch (fetchError: any) {
        console.error('SMS provider fetch error (URL 1):', fetchError);
        // Optionally, try the second URL as a fallback
        try {
            console.log('Attempting SMS with fallback URL:', SMS_API_URL_2);
            smsResponse = await fetch(SMS_API_URL_2, {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                 },
                 body: JSON.stringify(smsPayload),
            });
        } catch (fallbackFetchError: any) {
            console.error('SMS provider fetch error (URL 2 - fallback):', fallbackFetchError);
            throw new Error(`Failed to connect to SMS provider: ${fallbackFetchError.message}`);
        }
    }
    
    if (!smsResponse) {
        // Should not happen if one of the fetches succeeded or threw
        throw new Error('SMS provider response was unexpectedly undefined.');
    }

    // Analyze the response from your SMS provider
    // The success/failure criteria depends heavily on your provider's API
    const responseData = await smsResponse.text(); // Or .json() if it returns JSON

    if (!smsResponse.ok) {
      // Log the detailed error from the SMS provider for debugging
      console.error(`SMS sending failed. Status: ${smsResponse.status}, Response: ${responseData}`);
      // You might want to parse responseData if it's JSON and contains a specific error message
      throw new Error(`Failed to send OTP via SMS provider. Status: ${smsResponse.status}`);
    }

    // Assuming a successful response (e.g., status 200-299) means OTP was sent
    // Some providers might return a specific JSON field indicating success, e.g. { "code": 0, "message": "success" }
    // You'll need to adapt this logic based on your SMS provider's actual response format.
    console.log('SMS provider response:', responseData);


    return NextResponse.json({ success: true, message: 'OTP sent successfully via custom provider' });

  } catch (error: any) {
    console.error('Error sending OTP via custom provider:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
