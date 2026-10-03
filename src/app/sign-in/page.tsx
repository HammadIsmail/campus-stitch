"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useAuth } from "@/lib/auth-context";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [step, setStep] = React.useState<"email" | "otp">("email");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const { refreshAuth } = useAuth();

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to send verification code. Please try again.");
        return;
      }

      setSuccessMsg(`6-digit verification code sent to ${email.trim()}!`);
      setStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to email service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verify with NextAuth credentials provider
      const nextAuthResult = await signIn("credentials", {
        email: email.trim(),
        code: otp.trim(),
        redirect: false,
      });

      if (nextAuthResult?.error) {
        setErrorMsg("Invalid or expired 6-digit code. Please check your inbox and try again.");
        return;
      }

      // 2. Also ensure local session and JWT cookie are synced
      await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: otp.trim() }),
      });

      await refreshAuth();

      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect") || "/";
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-sm mx-auto w-full">
          {/* Logo & Headline */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 bg-black text-white rounded-2xl mx-auto flex items-center justify-center font-black text-lg shadow-md">
              CS
            </div>
            <h1 className="text-xl font-extrabold text-black tracking-tight">
              Sign In to CampuStitch
            </h1>
            <p className="text-xs text-zinc-500 max-w-xs">
              UET Lahore Student Life Platform. Enter your email to receive your 6-digit OTP code.
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="w-full mb-4 p-3 bg-zinc-100 border border-zinc-300 rounded-xl text-xs text-black font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="w-full mb-4 p-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-black font-medium flex items-start gap-2">
              <CheckCircle2 size={16} className="text-black shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Mail size={13} />
                    <span>Student Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    aria-label="Student email"
                    placeholder="e.g. 2021-cs-104@uet.edu.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                  />
                  <span className="text-[11px] text-zinc-400">
                    We will send a 6-digit OTP code directly to your email.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending OTP code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-black flex items-center gap-1.5">
                      <KeyRound size={13} />
                      <span>6-Digit Passcode</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setOtp("");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-zinc-500 hover:text-black font-semibold underline cursor-pointer"
                    >
                      Change email
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    aria-label="Verification code"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    className="w-full h-11 px-3 border border-zinc-300 rounded-xl text-center text-base tracking-widest font-mono font-bold text-black focus:outline-none focus:border-black"
                  />
                  <span className="text-[11px] text-zinc-400 text-center block">
                    Enter the code sent to {email}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="text-zinc-500 hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Resend code</span>
                  </button>
                  <span className="text-zinc-400">Expires in 10 mins</span>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-zinc-100 text-center">
              <span className="text-xs text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-bold text-black hover:underline"
                >
                  Create Student Account
                </Link>
              </span>
            </div>
          </div>

          {/* Verification info note */}
          <div className="mt-5 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1">
            <ShieldCheck size={13} className="text-black" />
            <span>Student card verification required after first sign-in.</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
