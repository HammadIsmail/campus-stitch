import { NextRequest, NextResponse } from "next/server";
import { getJwtFromRequest, verifyJwtToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = getJwtFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "No authentication token provided" },
        { status: 401 },
      );
    }

    const payload = await verifyJwtToken(token);

    if (!payload) {
      return NextResponse.json(
        { authenticated: false, message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: payload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, message: "Authentication verification failed" },
      { status: 500 },
    );
  }
}
