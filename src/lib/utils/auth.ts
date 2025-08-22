import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const OTP_SECRET = process.env.OTP_SECRET || 'fallback-otp-secret';

// Generate JWT token
export function generateToken(payload: any, expiresIn: string = '7d'): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate token');
  }
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create OTP token (signed)
export function createOTPToken(contactNumber: string, otp: string): string {
  const payload = {
    contactNumber,
    otp,
    timestamp: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  };
  return jwt.sign(payload, OTP_SECRET);
}

// Verify OTP token
export function verifyOTPToken(token: string, providedOTP: string): { valid: boolean; contactNumber?: string } {
  try {
    const decoded = jwt.verify(token, OTP_SECRET) as any;
    
    // Check if token is expired
    if (Date.now() > decoded.expiresAt) {
      return { valid: false };
    }
    
    // Check if OTP matches
    if (decoded.otp !== providedOTP) {
      return { valid: false };
    }
    
    return { valid: true, contactNumber: decoded.contactNumber };
  } catch (error) {
    return { valid: false };
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send OTP via email
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP for Farmer-Retailer Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verification Code</h2>
          <p>Your One-Time Password (OTP) for the Farmer-Retailer Platform is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes only.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from the Farmer-Retailer Platform.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

// Extract user from request headers
export function getUserFromRequest(request: Request): any {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

// Middleware to check authentication
export function requireAuth(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const user = getUserFromRequest(request);
    if (!user) {
      return Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return handler(request, user, ...args);
  };
}

// Middleware to check role
export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (request: Request, ...args: any[]) => {
      const user = getUserFromRequest(request);
      if (!user) {
        return Response.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (!roles.includes(user.role)) {
        return Response.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, user, ...args);
    };
  };
}
