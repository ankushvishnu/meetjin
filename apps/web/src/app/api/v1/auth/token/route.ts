import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signJWT } from '@/lib/keys';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const { api_key, intent_id } = body;

    if (!api_key || !intent_id) {
      return NextResponse.json(
        { error: 'Missing api_key or intent_id.' },
        { status: 400 }
      );
    }

    if (typeof api_key !== 'string' || !api_key.startsWith('jin_live_')) {
      return NextResponse.json(
        { error: 'Invalid api_key format. Key must start with "jin_live_".' },
        { status: 400 }
      );
    }

    // 1. Validate the api_key against Supabase
    const { data: keyData, error: dbError } = await supabaseAdmin
      .from('jin_keys')
      .select('status')
      .eq('key_string', api_key)
      .maybeSingle();

    if (dbError) {
      console.error('Database error during API key validation:', dbError);
      return NextResponse.json(
        { error: 'Internal validation failed.' },
        { status: 500 }
      );
    }

    if (!keyData) {
      return NextResponse.json(
        { error: 'API key not found or unauthorized.' },
        { status: 401 }
      );
    }

    if (keyData.status !== 'active') {
      return NextResponse.json(
        { error: 'API key has been revoked.' },
        { status: 401 }
      );
    }

    // 2. Sign JWT using server's Private RSA Key (RS256)
    const token = signJWT(intent_id);

    // 3. Return the standard OAuth-style token payload
    return NextResponse.json(
      {
        access_token: token,
        expires_in: 900, // 15 minutes
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('Unexpected error in JWT minting engine:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
