import * as jose from "jose";
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

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  "campus-stitch-jwt-secret-key-2026-uet-lahore-student-platform-secure";

const secretKey = new TextEncoder().encode(JWT_SECRET_STRING);

export const JWT_COOKIE_NAME = "campus_stitch_token";

/**
 * Sign a JWT token with the user payload and expiration time
 */
export async function signJwtToken(
  payload: JwtUserPayload,
  expiresIn: string = "7d",
): Promise<string> {
  const jwt = await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);

  return jwt;
}

/**
 * Verify a JWT token string. Returns the decoded payload or null if invalid/expired.
 */
export async function verifyJwtToken(
  token: string,
): Promise<JwtUserPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as unknown as JwtUserPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract JWT token from NextRequest cookies or Authorization header
 */
export function getJwtFromRequest(request: NextRequest): string | null {
  // 1. Check HTTP-only cookie
  const cookieToken = request.cookies.get(JWT_COOKIE_NAME)?.value;
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
}
