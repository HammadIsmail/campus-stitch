"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [studentId, setStudentId] = React.useState("");
  const [program, setProgram] = React.useState("BS Computer Science");
  const [email, setEmail] = React.useState("");
  const [hostel, setHostel] = React.useState("Hostel Block A");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim() || !email.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const studentProfile = {
      name: fullName.trim(),
      student_id: studentId.trim().toUpperCase(),
      program: program,
      email: email.trim().toLowerCase(),
      university: "UET Lahore",
      hostel_block: hostel,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      await supabase.auth.signUp({
        email: email.trim(),
        password: "TempPassword123!",
        options: {
          data: {
            full_name: studentProfile.name,
            student_id: studentProfile.student_id,
            program: studentProfile.program,
          },
        },
      });

      // Save user state locally
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "campus_stitch_current_user",
          JSON.stringify(studentProfile),
        );
      }

      // Redirect to student card verification to complete onboarding
      router.push("/verify");
    } catch (err: any) {
      console.warn("Sign up warning:", err);
      // Fallback local persistence
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "campus_stitch_current_user",
          JSON.stringify(studentProfile),
        );
      }
      router.push("/verify");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-sm mx-auto w-full py-8">
          {/* Logo & Headline */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 bg-black text-white rounded-2xl mx-auto flex items-center justify-center font-black text-lg shadow-md">
              CS
            </div>
            <h1 className="text-xl font-extrabold text-black tracking-tight">
              Create Student Account
            </h1>
            <p className="text-xs text-zinc-500 max-w-xs">
              Join UET Lahore&apos;s verified student network for daily commutes, marketplace, and hostel living.
            </p>
          </div>

          {errorMsg && (
            <div className="w-full mb-4 p-3 bg-zinc-100 border border-zinc-300 rounded-xl text-xs text-black font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Registration Form */}
          <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1">
                  <User size={13} />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Hammad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1">
                  <GraduationCap size={13} />
                  <span>Student ID / Roll No.</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2021-CS-104"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black uppercase font-mono placeholder:text-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1">
                  <Mail size={13} />
                  <span>University Email</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. 2021-cs-104@uet.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1">
                  <Building2 size={13} />
                  <span>Hostel / Residence</span>
                </label>
                <select
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black bg-white focus:outline-none focus:border-black"
                >
                  <option value="Hostel Block A">Hostel Block A (Boys)</option>
                  <option value="Hostel Block B">Hostel Block B (Boys)</option>
                  <option value="Zubair Hall">Zubair Hall</option>
                  <option value="Girls Hostel 1">Girls Hostel 1</option>
                  <option value="Girls Hostel 2">Girls Hostel 2</option>
                  <option value="Day Scholar">Day Scholar (Off-campus)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-zinc-100 text-center">
              <span className="text-xs text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-bold text-black hover:underline"
                >
                  Sign In
                </Link>
              </span>
            </div>
          </div>

          <div className="mt-5 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1">
            <ShieldCheck size={13} className="text-black" />
            <span>Campus ID card verification required to post rides or items.</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
