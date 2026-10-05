"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Phase: 1 = Email Input, 2 = Code + New Password, 3 = Success
  const [phase, setPhase] = React.useState<1 | 2 | 3>(1);

  // Form State
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Feedback State
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Resend cooldown
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Phase 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send reset code. Please check your email.");
      }

      setSuccessMsg(data.message || "A 6-digit code has been sent to your email.");
      setCooldown(60);
      setPhase(2);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Verify Code and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim() || code.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password. Please check your code.");
      }

      setPhase(3);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (cooldown > 0 || !email.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resend code.");
      }
      setSuccessMsg("A new 6-digit code has been sent to your email.");
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell hideNav={true}>
      <div className="w-full min-h-full flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-sm mx-auto w-full py-8">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white shadow-md mx-auto mb-1">
              <KeyRound size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              {phase === 3 ? "Password Reset Complete!" : "Reset Your Password"}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed mx-auto">
              {phase === 1 && "Enter the email associated with your student account to receive a 6-digit verification code."}
              {phase === 2 && `Enter the 6-digit verification code sent to ${email} and choose a new password.`}
              {phase === 3 && "Your password has been successfully updated. You can now log into your account."}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="w-full mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-900 dark:text-red-300 font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && phase === 2 && (
            <div className="w-full mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Card Container */}
          <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
            {/* Phase 1: Request Code Form */}
            {phase === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                    <Mail size={13} className="text-zinc-500 dark:text-zinc-400" />
                    <span>Student Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@uet.edu.pk or yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 disabled:opacity-50 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit Code</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Phase 2: Enter Code & Set New Password */}
            {phase === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* 6-Digit Code */}
                <div>
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <KeyRound size={13} className="text-zinc-500 dark:text-zinc-400" />
                      <span>6-Digit Verification Code</span>
                    </span>
                    <button
                      type="button"
                      disabled={cooldown > 0 || loading}
                      onClick={handleResendCode}
                      className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white disabled:opacity-50 cursor-pointer"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full h-11 px-3.5 text-center font-mono tracking-[6px] text-base font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                    <Lock size={13} className="text-zinc-500 dark:text-zinc-400" />
                    <span>New Password (min. 6 characters)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 px-3.5 pr-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                    <Lock size={13} className="text-zinc-500 dark:text-zinc-400" />
                    <span>Confirm New Password</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !code || !newPassword || !confirmPassword}
                  className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 disabled:opacity-50 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setPhase(1)}
                  className="w-full text-center text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer flex items-center justify-center gap-1.5 pt-1"
                >
                  <ArrowLeft size={13} />
                  <span>Change email address</span>
                </button>
              </form>
            )}

            {/* Phase 3: Success State */}
            {phase === 3 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Password Successfully Changed
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Your account password has been updated. You can now use your new password to sign in.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push("/sign-in")}
                  className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Sign In Now</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            )}

            {/* Link back to sign-in */}
            {phase !== 3 && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            )}
          </div>

          {/* Trust footnote */}
          <div className="mt-5 text-center text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-zinc-950 dark:text-zinc-300" />
            <span>Campus card verification required for all students.</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
