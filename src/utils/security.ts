import crypto from 'crypto';
import { CustomerUser } from '../types';

/**
 * ============================================================
 * TAR SOLUTIONS — CUSTOMER CREDENTIAL & SECURITY ENGINE
 * ============================================================
 * 
 * Rules:
 * 1. NEVER store plain-text passwords.
 * 2. Cryptographic hashing via Node.js native crypto.scryptSync.
 * 3. Unique 16-byte random salt per user.
 * 4. Timing-safe comparison to prevent side-channel attacks.
 * 5. Complete sanitization: passwords, hashes, and salts are
 *    NEVER returned to API responses or exposed to Admin Panel.
 * ============================================================
 */

export interface PasswordHashResult {
  salt: string;
  hash: string;
  combined: string;
}

/**
 * Hash password using crypto.scryptSync with a unique 16-byte random salt.
 */
export function hashPassword(password: string): PasswordHashResult {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return {
    salt,
    hash,
    combined: `scrypt:${salt}:${hash}`
  };
}

/**
 * Verify password against stored hash and salt with timing-safe comparison.
 */
export function verifyPassword(password: string, storedHash: string, salt?: string): boolean {
  if (!storedHash || !password) return false;

  try {
    let actualSalt = salt;
    let actualHash = storedHash;

    if (storedHash.startsWith('scrypt:')) {
      const parts = storedHash.split(':');
      if (parts.length === 3) {
        actualSalt = parts[1];
        actualHash = parts[2];
      }
    } else if (storedHash.includes(':') && !salt) {
      const parts = storedHash.split(':');
      if (parts.length === 2) {
        actualSalt = parts[0];
        actualHash = parts[1];
      }
    }

    if (!actualSalt) {
      // Direct string comparison if legacy unhashed
      return password === storedHash;
    }

    const calculatedBuffer = crypto.scryptSync(password, actualSalt, 64);
    const storedBuffer = Buffer.from(actualHash, 'hex');

    if (calculatedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(calculatedBuffer, storedBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Strip sensitive credentials from customer record before sending over API or rendering in Admin UI.
 */
export function sanitizeCustomer(customer: any): CustomerUser {
  if (!customer) return customer;
  const sanitized = { ...customer };
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.salt;
  return sanitized as CustomerUser;
}

/**
 * Clean and format Indian 10-digit mobile number.
 */
export function cleanMobile(phone: string): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1);
  return digits.slice(-10);
}

/**
 * Validate 10-digit Indian mobile number (starts with 6, 7, 8, or 9).
 */
export function validateIndianMobile(mobile: string): boolean {
  const clean = cleanMobile(mobile);
  return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
}

/**
 * Validate email format (optional field).
 */
export function validateEmail(email?: string | null): boolean {
  if (!email || !String(email).trim()) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/**
 * Validate password requirements (minimum 6 characters).
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
}
