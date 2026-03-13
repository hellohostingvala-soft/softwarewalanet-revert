/**
 * AES-256 Key Encryption Utilities
 * Keys are encrypted using the Web Crypto API (AES-GCM, 256-bit).
 * The master encryption key is sourced only from the environment variable
 * VITE_AI_SERVICE_MASTER_KEY and is NEVER logged or exposed.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 200_000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Retrieve master key from environment.
 * NOTE: In this Vite/React browser app all encryption runs client-side.
 * The VITE_ prefix is required for Vite to expose the variable.
 * For production deployments with server-side capabilities, move
 * encryption/decryption to a Supabase Edge Function so the master key
 * is never shipped in the client bundle.
 */
function getMasterKey(): string {
  const key = import.meta.env.VITE_AI_SERVICE_MASTER_KEY;
  if (!key) {
    throw new Error('VITE_AI_SERVICE_MASTER_KEY environment variable is not set');
  }
  return key;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedKey {
  ciphertext: string;
  iv: string;
  salt: string;
}

/**
 * Encrypt a plaintext API key using AES-256-GCM.
 * Raw key is never returned or logged after this call.
 */
export async function encryptApiKey(plaintext: string): Promise<EncryptedKey> {
  const masterKey = getMasterKey();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(masterKey, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  };
}

/**
 * Decrypt an encrypted API key.
 * Used internally by ai-gateway only – result must not be logged.
 */
export async function decryptApiKey(encrypted: EncryptedKey): Promise<string> {
  const masterKey = getMasterKey();
  const salt = new Uint8Array(atob(encrypted.salt).split('').map(c => c.charCodeAt(0)));
  const iv = new Uint8Array(atob(encrypted.iv).split('').map(c => c.charCodeAt(0)));
  const ciphertext = new Uint8Array(atob(encrypted.ciphertext).split('').map(c => c.charCodeAt(0)));

  const key = await deriveKey(masterKey, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );
  return decoder.decode(decrypted);
}

/**
 * Serialize EncryptedKey to a single storable string (JSON).
 * Safe to store in the database – never contains the raw key.
 */
export function serializeEncryptedKey(enc: EncryptedKey): string {
  return JSON.stringify(enc);
}

/**
 * Deserialize a stored string back to EncryptedKey.
 */
export function deserializeEncryptedKey(stored: string): EncryptedKey {
  return JSON.parse(stored) as EncryptedKey;
}

/**
 * Mask a key for safe display in logs/UI (shows only first 4 chars).
 * NEVER pass raw decrypted keys here.
 */
export function maskKey(encryptedStored: string): string {
  return '[encrypted:' + encryptedStored.substring(0, 8) + '...]';
}
