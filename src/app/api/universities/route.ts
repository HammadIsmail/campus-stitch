import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_UNIVERSITIES, searchUniversities } from "@/lib/universities";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const list = q ? searchUniversities(q) : SUPPORTED_UNIVERSITIES;

    return NextResponse.json({
      success: true,
      count: list.length,
      universities: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch universities" },
      { status: 500 }
    );
  }
}
