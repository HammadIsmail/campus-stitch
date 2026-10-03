interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Global OTP map across requests in Node.js runtime
declare global {
  // eslint-disable-next-line no-var
  var __campustitch_otps: Map<string, OtpRecord> | undefined;
}

const otpMap = globalThis.__campustitch_otps ?? new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== "production") {
  globalThis.__campustitch_otps = otpMap;
}

/**
 * Generate a random 6-digit numeric OTP code
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Save an OTP code for an email with a 10-minute expiry
 */
export function saveOtp(email: string, code: string, ttlMs = 10 * 60 * 1000): void {
  const cleanEmail = email.trim().toLowerCase();
  otpMap.set(cleanEmail, {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0,
  });
}

/**
 * Verify an OTP code for an email
 */
export function verifyOtp(email: string, inputCode: string): { valid: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpMap.get(cleanEmail);

  if (!record) {
    return { valid: false, error: "No OTP was requested for this email or it has expired." };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(cleanEmail);
    return { valid: false, error: "The verification code has expired. Please request a new one." };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpMap.delete(cleanEmail);
    return { valid: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  if (record.code !== inputCode.trim()) {
    return { valid: false, error: "Incorrect 6-digit verification code. Please try again." };
  }

  // Verification succeeded - consume the OTP so it cannot be reused
  otpMap.delete(cleanEmail);
  return { valid: true };
}
