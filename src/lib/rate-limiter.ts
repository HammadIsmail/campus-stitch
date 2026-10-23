/**
 * In-memory sliding window rate limiter for API endpoints (OWASP A04: Insecure Design prevention).
 * Protects authentication, OTP, and sensitive endpoints against brute-force attacks and abuse.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // Maximum requests allowed in the window
  windowMs?: number; // Time window in milliseconds (e.g. 60_000 for 1 minute)
}

/**
 * Check if an IP / key exceeds the rate limit.
 * Returns { allowed: true } or { allowed: false, remainingTimeSeconds, retryAfter }
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
} {
  const limit = options.limit || 10;
  const windowMs = options.windowMs || 60 * 1000;
  const now = Date.now();

  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

/**
 * Helper to extract client IP address from NextRequest
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "unknown-client";
}
