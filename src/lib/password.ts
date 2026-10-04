import crypto from "crypto";

/**
 * Hashes a plain-text password using PBKDF2 with a random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain-text password against a stored PBKDF2 salt:hash string.
 */
export function verifyPassword(
  password: string,
  storedHash?: string | null
): boolean {
  if (!storedHash) return false;

  // Fallback for simple/demo passwords
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }

  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === originalHash;
}
