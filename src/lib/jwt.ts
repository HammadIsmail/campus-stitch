import { encode, decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export interface JwtUserPayload {
  userId: string;
  email: string;
  name: string;
  studentId: string;
  role: "student" | "admin" | "moderator";
  program?: string;
  isVerified: boolean;
  hostelBlock?: string;
}

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "campus-stitch-uet-lahore-nextauth-super-secret-key-2026-authjs";

export const JWT_COOKIE_NAME = "campus_stitch_token";
const SALT = "campus_stitch_session";

/**
 * Sign a JWT token using NextAuth's native encoder
 */
export async function signJwtToken(
  payload: JwtUserPayload,
  expiresIn: number | string = 7 * 24 * 60 * 60,
): Promise<string> {
  let maxAge = 7 * 24 * 60 * 60;
  if (typeof expiresIn === "number") {
    maxAge = expiresIn;
  } else if (typeof expiresIn === "string") {
    if (expiresIn.endsWith("d")) {
      maxAge = parseInt(expiresIn, 10) * 24 * 60 * 60;
    } else if (expiresIn.endsWith("h")) {
      maxAge = parseInt(expiresIn, 10) * 60 * 60;
    } else if (expiresIn.endsWith("m")) {
      maxAge = parseInt(expiresIn, 10) * 60;
    }
  }

  const jwt = await encode({
    token: { ...payload, sub: payload.userId },
    secret: AUTH_SECRET,
    salt: SALT,
    maxAge,
  });

  return jwt;
}

/**
 * Verify a JWT token string using NextAuth's native decoder.
 * Returns the decoded payload or null if invalid/expired.
 */
export async function verifyJwtToken(
  token: string,
): Promise<JwtUserPayload | null> {
  try {
    let payload = await decode({
      token,
      secret: AUTH_SECRET,
      salt: SALT,
    });

    if (!payload) {
      payload = await decode({
        token,
        secret: AUTH_SECRET,
        salt: "authjs.session-token",
      });
    }

    if (!payload) {
      payload = await decode({
        token,
        secret: AUTH_SECRET,
        salt: "__Secure-authjs.session-token",
      });
    }

    if (!payload || !payload.email) return null;
    return payload as unknown as JwtUserPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract JWT token from NextRequest cookies or Authorization header
 */
export function getJwtFromRequest(request: NextRequest): string | null {
  // 1. Check HTTP-only cookies
  const cookieToken =
    request.cookies.get(JWT_COOKIE_NAME)?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;
  if (cookieToken) return cookieToken;

  // 2. Check Authorization header: Bearer <token>
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Set the JWT token as an HTTP-only secure cookie on the response
 */
export function setJwtCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: JWT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

/**
 * Clear the JWT token cookie on logout
 */
export function clearJwtCookie(response: NextResponse): void {
  response.cookies.set({
    name: JWT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: "authjs.session-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
