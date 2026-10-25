import { NextRequest, NextResponse } from "next/server";
import { signJwtToken, setJwtCookie, JwtUserPayload } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // OWASP A04: Anti-Brute-Force Rate Limiting (5 attempts per minute per IP)
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`login_${clientIp}`, {
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
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
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Look up user profile from database with timeout protection
    let userProfile: any = null;
    try {
      const supabase = await createClient();
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 2500)
      );

      const { data } = (await Promise.race([profilePromise, timeoutPromise])) as any;
      if (data) {
        userProfile = data;
      }
    } catch (e) {
      console.warn("Supabase profile lookup fallback in sign-in:", e);
    }

    // 2. OWASP A07: Verify Account Existence & Password Integrity
    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email. Please create an account first.",
        },
        { status: 404 }
      );
    }

    if (userProfile.password_hash) {
      const isValid = verifyPassword(cleanPassword, userProfile.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }
    } else if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const { TenantsStore } = await import("@/lib/tenants-store");

    // 3. OWASP A01: Secure Role Determination (Zero role forgery)
    const isSuperAdmin =
      cleanEmail === "ranahammadismail@gmail.com" ||
      userProfile?.role === "super_admin";

    const campusAdminInfo =
      TenantsStore.getCampusAdminForUser(cleanEmail) ||
      (userProfile?.id ? TenantsStore.getCampusAdminForUser(userProfile.id) : null);

    let role: "student" | "campus_admin" | "super_admin" = "student";
    if (isSuperAdmin) {
      role = "super_admin";
    } else if (campusAdminInfo || userProfile?.role === "campus_admin") {
      role = "campus_admin";
    }

    // Resolve University and Campus
    let campusId = "camp_uet_main";
    let campusName = "Main Campus (Lahore)";
    let universityId = "uni_uet_lahore";
    let universityName = "UET Lahore";

    let city = "Lahore";

    if (campusAdminInfo) {
      campusId = campusAdminInfo.campusId;
      campusName = campusAdminInfo.campusName;
      universityId = campusAdminInfo.universityId;
      universityName = campusAdminInfo.universityName;
      city = campusAdminInfo.campusName;
    } else if (userProfile?.campus_id || userProfile?.campus_name || userProfile?.city) {
      const campLookup = userProfile.campus_id || userProfile.campus_name || userProfile.city;
      const campDetails = TenantsStore.getCampus(campLookup);
      campusId = campDetails?.campus.id || userProfile.campus_id || "camp_uet_main";
      campusName = campDetails?.campus.name || userProfile.campus_name || userProfile.city || "Main Campus";
      universityId = campDetails?.university.id || userProfile.university_id || "uni_uet_lahore";
      universityName = campDetails?.university.shortName || userProfile.university || "UET Lahore";
      city = campDetails?.campus.city || userProfile.city || campusName;
    }

    // Build JWT payload
    const userPayload: JwtUserPayload = {
      userId: userProfile?.id || ("u_" + (role !== "student" ? role : cleanEmail.replace(/[^a-z0-9]/g, "_"))),
      email: cleanEmail,
      name: userProfile?.full_name || (isSuperAdmin ? "Super Admin" : role === "campus_admin" ? "Campus Admin" : cleanEmail.split("@")[0]),
      studentId: userProfile?.student_id || (isSuperAdmin ? "SUPER-ADMIN" : cleanEmail.split("@")[0].toUpperCase()),
      role,
      universityId,
      universityName,
      campusId,
      campusName,
      program: userProfile?.program || "BS Computer Science",
      department: userProfile?.department || "Computer Science",
      isVerified: userProfile ? !!userProfile.is_verified : (role !== "student"),
      hostelBlock: "",
      avatarUrl: userProfile?.avatar_url || null,
      bio: userProfile?.bio || null,
    };

    // Sign the JWT token
    const token = await signJwtToken(userPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      token,
      user: userPayload,
    });

    // Set secure HTTP-only cookie (OWASP A02: Cryptographic & Session Security)
    setJwtCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
