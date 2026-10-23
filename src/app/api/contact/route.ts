import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { sendContactFormEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`contact_${clientIp}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many support messages sent. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 60),
          },
        }
      );
    }

    const body = await request.json();
    const { name, email, university, category, subject, message } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide your full name." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUniversity = String(university || "UET Lahore").trim();
    const cleanCategory = String(category || "General Support").trim();
    const cleanSubject = String(subject || "General Inquiry").trim();
    const cleanMessage = String(message).trim();

    // Generate a unique ticket reference ID
    const ticketId = `CS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    console.log(`[SUPPORT TICKET ${ticketId}] From: ${cleanName} <${cleanEmail}> | Uni: ${cleanUniversity} | Cat: ${cleanCategory} | Subj: ${cleanSubject}`);

    // Dispatch automated confirmation email & notification (with fast timeout so user never hangs)
    try {
      const emailPromise = sendContactFormEmail({
        name: cleanName,
        email: cleanEmail,
        category: `${cleanCategory} (${cleanUniversity})`,
        subject: cleanSubject,
        message: cleanMessage,
        ticketRef: ticketId,
      });

      // Allow up to 3.5s for SMTP dispatch; background continues if slower
      await Promise.race([
        emailPromise,
        new Promise((resolve) => setTimeout(resolve, 3500)),
      ]);
    } catch (emailErr) {
      console.warn("Could not dispatch automated support email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: `Your support request has been logged under ticket #${ticketId}. Our campus team will respond shortly.`,
    });
  } catch (error: any) {
    console.error("Support API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to submit support ticket. Please try again." },
      { status: 500 }
    );
  }
}
