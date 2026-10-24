import { NextResponse } from "next/server";
import { AppVersionStore } from "@/lib/app-version-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const version = AppVersionStore.getVersionInfo();
    return NextResponse.json(
      {
        success: true,
        version,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Failed to get app version:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch app version" },
      { status: 500 }
    );
  }
}
