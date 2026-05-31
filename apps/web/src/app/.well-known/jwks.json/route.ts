import { NextResponse } from 'next/server';
import { getJWKS } from '@/lib/keys';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jwks = getJWKS();
    return NextResponse.json(jwks, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error: any) {
    console.error('Error generating JWKS:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
