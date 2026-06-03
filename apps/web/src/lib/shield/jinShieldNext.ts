/**
 * Jin Shield Edge-Compatible Gateway Boundary (Next.js App Router)
 * Generated automatically by @papercargo/jin-cli
 * 
 * Place this inside your Next.js middleware.ts file.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWKS_URL = process.env.JIN_JWKS_URL || 'https://meetjin.com/.well-known/jwks.json';

function matchPath(endpointPattern: string, actualPath: string): boolean {
  const normPattern = endpointPattern.endsWith('/') && endpointPattern !== '/' ? endpointPattern.slice(0, -1) : endpointPattern;
  const normActual = actualPath.endsWith('/') && actualPath !== '/' ? actualPath.slice(0, -1) : actualPath;
  let pattern = normPattern.replace(/\{([^}]+)\}/g, ':$1');

  let escaped = '';
  const specialChars = '.+^$()|{}[]\\';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (specialChars.indexOf(char) !== -1) {
      escaped += '\\' + char;
    } else {
      escaped += char;
    }
  }

  const regexString = '^' + escaped
    .replace(/:(\w+)\*/g, '(.*)')
    .replace(/:(\w+)/g, '([^/]+)')
    + '$';

  return new RegExp(regexString).test(normActual);
}

export async function verifyJinShield(req: NextRequest, jinJson: any) {
  const reqUrl = new URL(req.url);
  const reqPath = reqUrl.pathname;
  const reqMethod = req.method.toUpperCase();

  let isProtected = false;
  let matchedIntent: any = null;
  if (jinJson && jinJson.intents) {
    matchedIntent = jinJson.intents.find((i: any) => i.method.toUpperCase() === reqMethod && matchPath(i.endpoint, reqPath));
    isProtected = !!matchedIntent;
  }

  const authHeader = req.headers.get('authorization');
  const hasJinIdentity = typeof authHeader === 'string' && authHeader.startsWith('Jin-Identity ');

  if (!isProtected && !hasJinIdentity) return null;

  const block = (reason: string) => {
    return new NextResponse(
      JSON.stringify({ error: `Access Denied. ${reason}. Refer to protocol instructions at /.well-known/jin.json` }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  };

  if (!hasJinIdentity) return block('Missing Authorization: Jin-Identity header');
  const token = authHeader.substring('Jin-Identity '.length).trim();

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return block('Invalid JWT token format');
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const signatureStr = parts[2];

    if (header.alg !== 'RS256' || !header.kid) return block('Unsupported or missing key ID (kid)');
    if (!matchedIntent) return block('Endpoint not declared in jin.json');
    if (payload.intent_id !== matchedIntent.id) return block(`Passport intent '${payload.intent_id}' mismatch`);
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return block('Identity passport has expired');

    // Fetch keys from central authority via native Edge fetch
    const resKeys = await fetch(JWKS_URL);
    const jwks = await resKeys.json();
    const matchingJwk = jwks.keys.find((k: any) => k.kid === header.kid);
    if (!matchingJwk) return block('Signatory key ID not recognized');

    // Web Crypto RS256 Verification
    const publicKeyData = { kty: "RSA", n: matchingJwk.n, e: matchingJwk.e, alg: "RS256", ext: true };
    const key = await crypto.subtle.importKey(
      "jwk",
      publicKeyData,
      { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
      false,
      ["verify"]
    );
    const encoder = new TextEncoder();
    const signedInputBuffer = encoder.encode(parts[0] + '.' + parts[1]);
    const sigBinary = Uint8Array.from(atob(signatureStr.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

    const isSigValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sigBinary, signedInputBuffer);
    if (!isSigValid) return block('Invalid cryptographic passport signature');

    return null; // Passed completely
  } catch (err: any) {
    return block(`Verification failed: ${err.message}`);
  }
}
