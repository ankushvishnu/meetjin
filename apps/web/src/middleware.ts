/**
 * JIN SHIELD MIDDLEWARE — meetjin.com
 * 
 * Uses the official @papercargo/jin-cli generated shield adapter
 * to enforce the cryptographic trust perimeter on protected API routes.
 * 
 * Agents must present a valid RS256-signed JWT via:
 *   Authorization: Jin-Identity <token>
 * 
 * Tokens are obtained from POST /api/v1/auth/token with a valid jin_live_ API key.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJinShield } from '@/lib/shield/jinShieldNext';

// jin.json intent map for route-level intent matching.
// Currently null because meetjin.com's jin.json declares the Supabase edge
// function, not the Next.js registry API routes. The shield will still
// validate Jin-Identity tokens when present.
const jinJson: any = null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only shield registry API routes (agent-facing endpoints)
  // Publisher routes use API key auth, not Jin Identity tokens
  if (!pathname.startsWith('/api/v1/registry/')) {
    return NextResponse.next();
  }

  // If jin.json is not available, pass through with warning header
  if (!jinJson) {
    const response = NextResponse.next();
    response.headers.set('X-Jin-Shield', 'pass-through');
    response.headers.set('X-Jin-Shield-Reason', 'no-jin-json');
    return response;
  }

  // Delegate to the official Jin Shield adapter
  // Returns null if request passes, NextResponse if blocked
  const shieldResponse = await verifyJinShield(request, jinJson);

  if (shieldResponse) {
    // Request was blocked by the shield
    return shieldResponse;
  }

  // Request passed shield verification
  const response = NextResponse.next();
  response.headers.set('X-Jin-Shield', 'verified');
  return response;
}

export const config = {
  matcher: [
    // Shield all registry API routes
    '/api/v1/registry/:path*',
  ],
};
