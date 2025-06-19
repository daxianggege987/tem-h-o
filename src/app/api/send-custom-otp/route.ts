
// IMPORTANT: This API route now attempts to integrate with a specific third-party SMS provider.
// You MUST:
// 1. Replace console logging of OTP with a secure OTP storage mechanism (e.g., Firestore, Redis).
// 2. Move credentials (SMS_API_URL, SMS_USERNAME, SMS_PASSWORD) to environment variables for security.
// 3. Verify the exact API request structure (JSON fields, headers) required by your SMS provider.
// 4. Implement robust error handling and logging for the SMS provider's response.

/*
import { type NextRequest, NextResponse } from 'next/server';

const TEST_PHONE_NUMBER_E164 = "+8613181914554";
const FIXED_OTP_FOR_TEST_ACCOUNT = "111111";

// Helper function to generate a simple 6-digit OTP
function generateOtp(phoneNumber: string): string {
  if (phoneNumber === TEST_PHONE_NUMBER_E164) {
    return FIXED_OTP_FOR_TEST_ACCOUNT;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configuration for your third-party SMS provider
// TODO: Move these to environment variables (e.g., process.env.SMS_API_URL)
const SMS_API_URL_1 = 'http://61.147.98.117:9001';
const SMS_API_URL_2 = 'http://61.147.98.117:9015';
const SMS_USERNAME = '13181914554';
const SMS_RAW_PASSWORD = '474466615';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body; // Expecting E.164 format from client, e.g., +8613xxxxxxxxx

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Generate OTP (fixed for test account, random for others)
    const otp = generateOtp(phoneNumber);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // 2. Store OTP (CRITICAL: Replace with secure storage like Firestore or Redis)
    // For demonstration, we'll log it. DO NOT use this in production.
    // Ensure your storage mechanism includes this expiry time.
    console.log(`OTP for ${phoneNumber}: ${otp} (Expires: ${otpExpiry.toISOString()})`);
    // Example: await saveOtpToDatabase(phoneNumber, otp, otpExpiry);
    // You would typically store: { phoneNumber, otp, expiry, verified: false }

    // For the test account, we don't actually send an SMS.
    // For other accounts, proceed to send SMS.
    if (phoneNumber !== TEST_PHONE_NUMBER_E164) {
      const encodedPassword = Buffer.from(SMS_RAW_PASSWORD).toString('base64');
      const message = `验证码：${otp}，请于5分钟内完成验证，若非本人操作，请忽略本短信`;

      const smsPayload = {
        username: SMS_USERNAME,
        password: encodedPassword,
        mobile: phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber,
        content: message,
      };

      let smsResponse;
      try {
        smsResponse = await fetch(SMS_API_URL_1, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(smsPayload),
        });
      } catch (fetchError: any) {
          console.error('SMS provider fetch error (URL 1):', fetchError);
          try {
              console.log('Attempting SMS with fallback URL:', SMS_API_URL_2);
              smsResponse = await fetch(SMS_API_URL_2, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(smsPayload),
              });
          } catch (fallbackFetchError: any) {
              console.error('SMS provider fetch error (URL 2 - fallback):', fallbackFetchError);
              throw new Error(`Failed to connect to SMS provider: ${fallbackFetchError.message}`);
          }
      }
      
      if (!smsResponse) {
          throw new Error('SMS provider response was unexpectedly undefined.');
      }

      const responseData = await smsResponse.text(); 

      if (!smsResponse.ok) {
        console.error(`SMS sending failed. Status: ${smsResponse.status}, Response: ${responseData}`);
        throw new Error(`Failed to send OTP via SMS provider. Status: ${smsResponse.status}`);
      }
      console.log('SMS provider response for non-test account:', responseData);
    } else {
      console.log(`OTP for test account ${phoneNumber} is ${otp}. SMS not sent.`);
    }

    return NextResponse.json({ success: true, message: phoneNumber === TEST_PHONE_NUMBER_E164 ? 'Test OTP generated, proceed to enter it.' : 'OTP sent successfully via custom provider' });

  } catch (error: any) {
    console.error('Error sending OTP via custom provider:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
*/

// This API route is no longer used with Social Sign-In.
// Kept for reference or if phone OTP is re-introduced later.
import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ error: 'Phone OTP is disabled. Use social sign-in.' }, { status: 404 });
}
