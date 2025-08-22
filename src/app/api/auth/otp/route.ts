import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, createOTPToken, sendOTPEmail } from '@/lib/utils/auth';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactNumber, email } = body;

    // Validate input
    if (!contactNumber) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Contact number is required'
      }, { status: 400 });
    }

    // For this implementation, we'll use email as the contact method
    // In production, you might want to support both SMS and email
    const emailToUse = email || `${contactNumber}@example.com`; // Fallback for demo

    // Generate OTP
    const otp = generateOTP();
    
    // Create signed OTP token
    const otpToken = createOTPToken(contactNumber, otp);

    // Send OTP via email
    const emailSent = await sendOTPEmail(emailToUse, otp);

    if (!emailSent) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to send OTP. Please try again.'
      }, { status: 500 });
    }

    // Return success response with token (in production, don't return the actual OTP)
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        otpToken,
        message: `OTP sent to ${emailToUse}`,
        // Remove this in production - only for demo purposes
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });

  } catch (error) {
    console.error('OTP generation error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json<ApiResponse>({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}
