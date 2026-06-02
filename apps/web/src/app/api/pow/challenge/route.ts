import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveChallenge } from '@/lib/pow/pow-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pow/challenge
 * 
 * Generates a cryptographically random 32-byte hex string,
 * saves it in the memory store with a 5-minute TTL and difficulty of 4,
 * and returns it.
 */
export async function GET() {
  try {
    // Generate a cryptographically random 32-byte hex string
    const challengeString = crypto.randomBytes(32).toString('hex');
    const difficulty = 4; // requires '0000' hash prefix
    const ttlMs = 5 * 60 * 1000; // 5 minutes TTL

    // Save to the in-memory store
    saveChallenge(challengeString, difficulty, ttlMs);

    // Return the response with cache prevention headers to ensure fresh challenges
    return NextResponse.json(
      { challengeString, difficulty },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error generating PoW challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate security challenge' },
      { status: 500 }
    );
  }
}
