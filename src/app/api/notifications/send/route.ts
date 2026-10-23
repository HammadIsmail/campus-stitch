import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIds, title, body: content, data, url } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ success: false, error: "userIds array required" }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "title and body required" }, { status: 400 });
    }

    const result = await sendPushNotification({
      userIds,
      title,
      body: content,
      data,
      url,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("API send notification error:", err);
    return NextResponse.json({ success: false, error: "Failed to dispatch notification" }, { status: 500 });
  }
}
