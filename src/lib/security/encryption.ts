// ==============================================
// Data Encryption Utilities
// ==============================================
// Symmetric AES-GCM encryption / decryption using
// the Web Crypto API.  Suitable for encrypting
// sensitive fields before storing in the browser
// (e.g. cached session data, local preferences).

// ---------- Constants ----------

const KEY_ALGORITHM = { name: 'AES-GCM', length: 256 } as const;
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 310_000; // OWASP minimum for PBKDF2-SHA-256
const PBKDF2_HASH = 'SHA-256';

// ---------- Key derivation ----------

/**
 * Derive a 256-bit AES key from a passphrase and salt using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    baseKey,
    KEY_ALGORITHM,
    false,
    ['encrypt', 'decrypt'],
  );
}

// ---------- Encrypt ----------

/**
 * Encrypt plaintext with AES-256-GCM.
 * Returns a base64-encoded string containing: salt | iv | ciphertext.
 */
export async function encrypt(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );

  // Concatenate salt + iv + ciphertext
  const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH);

  return btoa(Array.from(result, b => String.fromCharCode(b)).join(''));
}

// ---------- Decrypt ----------

/**
 * Decrypt a base64-encoded payload previously produced by `encrypt()`.
 */
export async function decrypt(ciphertext: string, passphrase: string): Promise<string> {
  const bytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const salt = bytes.slice(0, SALT_LENGTH);
  const iv = bytes.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const data = bytes.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  );

  return new TextDecoder().decode(decrypted);
}

// ---------- Secure random helpers ----------

/** Generate a cryptographically-secure random hex string of `byteLength` bytes. */
export function randomHex(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Generate a URL-safe base64 random token. */
export function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ---------- Hash utilities ----------

/** Compute a SHA-256 digest of the input string; returns a hex string. */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** One-way hash a sensitive value (e.g. backup code) for safe storage. */
export async function hashForStorage(value: string): Promise<string> {
  return sha256(`sv:${value}`);
}

// ---------- Secure storage helpers ----------

const SESSION_KEY_PREFIX = 'sv_enc_';

/** Persist an encrypted value in sessionStorage. */
export async function secureSessionSet(
  key: string,
  value: string,
  passphrase: string,
): Promise<void> {
  const encrypted = await encrypt(value, passphrase);
  sessionStorage.setItem(SESSION_KEY_PREFIX + key, encrypted);
}

/** Retrieve and decrypt a value from sessionStorage. Returns null on failure. */
export async function secureSessionGet(
  key: string,
  passphrase: string,
): Promise<string | null> {
  const raw = sessionStorage.getItem(SESSION_KEY_PREFIX + key);
  if (!raw) return null;
  try {
    return await decrypt(raw, passphrase);
  } catch {
    return null;
  }
}

/** Remove a securely-stored value. */
export function secureSessionRemove(key: string): void {
  sessionStorage.removeItem(SESSION_KEY_PREFIX + key);
}
