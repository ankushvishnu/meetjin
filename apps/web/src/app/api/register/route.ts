import { NextRequest, NextResponse } from 'next/server';
import { verifyPoW } from '@/lib/pow/pow-verify';

/**
 * POST /api/register
 * 
 * Handles user registration. Checks the provided Cryptographic Proof-of-Work solution.
 * If validation fails, returns 403 Forbidden.
 * If validation succeeds, processes standard mock registration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, powChallenge, powNonce } = body;

    // 1. Basic validation of request body fields
    if (!email || !password || !powChallenge || powNonce === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, powChallenge, and powNonce' },
        { status: 400 }
      );
    }

    // 2. Call verifyPoW utility function
    const isPoWValid = verifyPoW(powChallenge, Number(powNonce));
    if (!isPoWValid) {
      return NextResponse.json(
        { error: 'Invalid or expired security token.' },
        { status: 403 }
      );
    }

    // 3. PoW passes, proceed with standard mock user registration
    const mockUser = {
      id: `usr_${crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2, 15)}`,
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: mockUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in registration endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
