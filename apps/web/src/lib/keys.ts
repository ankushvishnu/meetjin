import * as crypto from 'crypto';

const KEY_ID = 'jin-jwks-key-v1';

/**
 * Decodes the base64-encoded private key from env.
 */
export function getPrivateKeyPem(): string {
  const b64 = process.env.JWT_PRIVATE_KEY_B64;
  if (!b64) {
    throw new Error(
      'Missing JWT_PRIVATE_KEY_B64 environment variable. Please run `node scripts/generate-rsa-keypair.mjs` and add the private key to your .env.local.'
    );
  }
  return Buffer.from(b64, 'base64').toString('utf-8');
}

/**
 * Returns the public JSON Web Key Set (JWKS) dynamically derived from the private key.
 */
export function getJWKS() {
  const privateKeyPem = getPrivateKeyPem();
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const publicKey = crypto.createPublicKey(privateKey);
  
  // Native dynamic JWK export (supported in Node 15.9.0+)
  const jwk = publicKey.export({ format: 'jwk' });

  return {
    keys: [
      {
        ...jwk,
        kid: KEY_ID,
        alg: 'RS256',
        use: 'sig',
      },
    ],
  };
}

/**
 * Helper to encode strings as base64url.
 */
function base64url(str: string | Buffer): string {
  const buf = typeof str === 'string' ? Buffer.from(str) : str;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Signs a JWT using the private key and RS256 algorithm.
 * Payload includes: iss ("meetjin.com"), intent_id, and exp (15 min from now).
 * Includes the "kid" in the JWT header.
 */
export function signJWT(intentId: string): string {
  const privateKeyPem = getPrivateKeyPem();

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: KEY_ID,
  };

  const nowSecs = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'meetjin.com',
    intent_id: intentId,
    iat: nowSecs,
    exp: nowSecs + 900, // 15 minutes from now
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(privateKeyPem);
  const encodedSignature = base64url(signature);

  return `${unsignedToken}.${encodedSignature}`;
}
