import * as crypto from 'crypto';

console.log('Generating production-grade RSA-2048 keypair...');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

const privateKeyB64 = Buffer.from(privateKey).toString('base64');
const publicKeyB64 = Buffer.from(publicKey).toString('base64');

console.log('\n======================================================');
console.log('🔒 CRYPTOGRAPHIC RSA KEYPAIR GENERATION SUCCESSFUL');
console.log('======================================================\n');
console.log('Add the following environment variable to your web app\'s .env.local file:');
console.log('\n---------------- .env.local ----------------\n');
console.log(`JWT_PRIVATE_KEY_B64="${privateKeyB64}"`);
console.log('\n--------------------------------------------\n');
console.log('💡 Note: Keep the private key secure. Do NOT commit it to Git!');
console.log('💡 The public key and JWKS will be dynamically derived from this private key at runtime.');
console.log('\nFor reference, here is the public key (SPKI PEM Base64):');
console.log(publicKeyB64.slice(0, 60) + '...');
