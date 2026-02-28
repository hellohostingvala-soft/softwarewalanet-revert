/**
 * Browser-compatible encryption utilities for API key management.
 * Uses Web Crypto API for cryptographic operations.
 */

const CIPHER_PREFIX = 'enc:v1:';

/**
 * Derives a CryptoKey from a master key string using PBKDF2.
 */
async function deriveCryptoKey(masterKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(masterKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

/**
 * Encrypts plaintext using AES-256-GCM with a master key.
 * Returns a base64-encoded ciphertext prefixed with CIPHER_PREFIX.
 */
export async function encryptApiKey(plaintext: string, masterKey: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveCryptoKey(masterKey, salt);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  const payload = new Uint8Array(salt.length + iv.length + cipherBuffer.byteLength);
  payload.set(salt, 0);
  payload.set(iv, salt.length);
  payload.set(new Uint8Array(cipherBuffer), salt.length + iv.length);

  return CIPHER_PREFIX + bufferToBase64(payload.buffer);
}

/**
 * Decrypts a ciphertext produced by encryptApiKey.
 */
export async function decryptApiKey(ciphertext: string, masterKey: string): Promise<string> {
  if (!ciphertext.startsWith(CIPHER_PREFIX)) {
    throw new Error('Invalid ciphertext format: missing prefix');
  }

  const payload = base64ToBuffer(ciphertext.slice(CIPHER_PREFIX.length));
  const salt = payload.slice(0, 16);
  const iv = payload.slice(16, 28);
  const data = payload.slice(28);

  const key = await deriveCryptoKey(masterKey, salt);
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

  return new TextDecoder().decode(plainBuffer);
}

/**
 * Computes SHA-256 hash of the input string. Returns hex string.
 */
export async function hashString(input: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a RFC 4122 UUID v4.
 */
export function generateKeyId(): string {
  return crypto.randomUUID();
}

/**
 * Re-encrypts an existing ciphertext under a new master key.
 */
export async function rotateKey(
  oldEncrypted: string,
  oldMaster: string,
  newMaster: string
): Promise<string> {
  const plaintext = await decryptApiKey(oldEncrypted, oldMaster);
  return encryptApiKey(plaintext, newMaster);
}
