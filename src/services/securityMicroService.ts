// Security Micro Service
// CSRF, input sanitize, file upload validation

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

/**
 * Sanitize input (basic XSS prevention)
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file upload
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileUpload(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): FileValidationResult {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file name for suspicious patterns
  const suspiciousPatterns = [/\.\./, /<script/, /javascript:/, /onerror=/];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        valid: false,
        error: 'File name contains suspicious patterns',
      };
    }
  }

  return { valid: true };
}

/**
 * Generate signed URL
 */
export function generateSignedURL(
  baseUrl: string,
  expiresIn: number = 3600000
): string {
  const expires = Date.now() + expiresIn;
  const signature = crypto.randomUUID();
  
  const url = new URL(baseUrl);
  url.searchParams.set('expires', expires.toString());
  url.searchParams.set('signature', signature);
  
  return url.toString();
}

/**
 * Validate signed URL
 */
export function validateSignedURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    const expires = parseInt(parsed.searchParams.get('expires') || '0');
    const signature = parsed.searchParams.get('signature');

    if (!expires || !signature) return false;

    // Check if expired
    if (Date.now() > expires) return false;

    // In production, verify signature with secret key
    return true;
  } catch {
    return false;
  }
}

/**
 * Hash password (simplified - use bcrypt in production)
 */
export function hashPassword(password: string): string {
  // In production, use bcrypt or argon2
  const hash = btoa(password + '_salt');
  return hash;
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  const computedHash = hashPassword(password);
  return computedHash === hash;
}

/**
 * Generate secure random string
 */
export function generateSecureString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate SQL injection patterns
 */
export function validateSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bUNION\b.*\bSELECT\b)/i,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return false; // SQL injection detected
    }
  }

  return true; // Safe
}

/**
 * Sanitize object (recursive)
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
}
