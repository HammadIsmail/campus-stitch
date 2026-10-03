import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOtp } from "@/lib/otp-store";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const code = String(credentials.code).trim();

        // Verify the 6-digit OTP code against the otp-store
        const verification = verifyOtp(email, code);
        if (!verification.valid) {
          throw new Error(verification.error || "Invalid verification code");
        }

        const isAdmin =
          email.includes("admin") ||
          email === "admin@uet.edu.pk" ||
          email === "ranahammadismail@gmail.com";

        return {
          id: "u_" + (isAdmin ? "admin" : email.replace(/[^a-z0-9]/g, "_")),
          email,
          name: isAdmin ? "Admin Moderator" : email.split("@")[0],
          studentId: isAdmin ? "UET-ADMIN-01" : email.split("@")[0].toUpperCase(),
          role: isAdmin ? "admin" : "student",
          program: "BS Computer Science",
          isVerified: true,
          hostelBlock: "Hostel Block A",
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.studentId = (user as any).studentId;
        token.role = (user as any).role;
        token.program = (user as any).program;
        token.isVerified = (user as any).isVerified;
        token.hostelBlock = (user as any).hostelBlock;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).studentId = token.studentId;
        (session.user as any).role = token.role;
        (session.user as any).program = token.program;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).hostelBlock = token.hostelBlock;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
