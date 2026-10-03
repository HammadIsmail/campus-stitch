import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body?.text;
    const requestedVoice =
      body?.voiceId || process.env.UPLIFT_VOICE || "Prime Time Anchor";
    const apiKey = process.env.UPLIFT_API_KEY;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "UPLIFT_API_KEY is not configured" },
        { status: 500 },
      );
    }

    // Map common names or normalize to hyphenated slug
    const voiceId = requestedVoice
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-");

    const response = await fetch(
      "https://api.upliftai.org/v1/synthesis/text-to-speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId,
          outputFormat: "MP3_22050_128",
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to synthesize speech" },
        { status: response.status },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mp3",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    console.error("Uplift AI TTS error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
