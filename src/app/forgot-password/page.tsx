"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  useRequestResetCodeMutation,
  useConfirmResetPasswordMutation,
} from "@/hooks/use-profile-queries";

const requestEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .transform((val) => val.trim().toLowerCase()),
});

type RequestEmailFormData = z.infer<typeof requestEmailSchema>;

const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .length(6, "Code must be exactly 6 digits.")
      .regex(/^\d{6}$/, "Code must contain only digits."),
    newPassword: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Phase: 1 = Email Input, 2 = Code + New Password, 3 = Success
  const [phase, setPhase] = React.useState<1 | 2 | 3>(1);
  const [submittedEmail, setSubmittedEmail] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Feedback State
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Cooldown
  const [cooldown, setCooldown] = React.useState(0);

  // TanStack Query Mutations
  const requestResetMutation = useRequestResetCodeMutation();
  const confirmResetMutation = useConfirmResetPasswordMutation();

  // Form 1: Request Code
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<RequestEmailFormData>({
    resolver: zodResolver(requestEmailSchema),
    defaultValues: { email: "" },
  });

  // Form 2: Reset Password
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setResetValue,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetCode = watchReset("code");

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Phase 1: Request Reset Code via Query Mutation
  const onRequestCode = (data: RequestEmailFormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittedEmail(data.email);

    requestResetMutation.mutate(
      { email: data.email },
      {
        onSuccess: (res) => {
          setSuccessMsg(res.message || "A 6-digit code has been sent to your email.");
          setCooldown(60);
          setPhase(2);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to send reset code. Please check your email.");
        },
      }
    );
  };

  // Phase 2: Verify Code and Reset Password via Query Mutation
  const onResetPassword = (data: ResetPasswordFormData) => {
    setErrorMsg(null);

    confirmResetMutation.mutate(
      {
        email: submittedEmail,
        code: data.code,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setPhase(3);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to reset password. Please check your code.");
        },
      }
    );
  };

  // Resend code handler
  const handleResendCode = () => {
    if (cooldown > 0 || !submittedEmail || requestResetMutation.isPending) return;
    setErrorMsg(null);

    requestResetMutation.mutate(
      { email: submittedEmail },
      {
        onSuccess: () => {
          setSuccessMsg("A new 6-digit code has been sent to your email.");
          setCooldown(60);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Could not resend code.");
        },
      }
    );
  };

  const isPending = requestResetMutation.isPending || confirmResetMutation.isPending;

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
              {phase === 2 && `Enter the 6-digit verification code sent to ${submittedEmail} and choose a new password.`}
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
            {/* Phase 1: Request Code Form with react-hook-form */}
            {phase === 1 && (
              <form onSubmit={handleSubmitEmail(onRequestCode)} className="space-y-4" noValidate>
                <div>
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                    <Mail size={13} className="text-zinc-500 dark:text-zinc-400" />
                    <span>Student Email Address</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@uet.edu.pk or yourname@gmail.com"
                    disabled={isPending}
                    {...registerEmail("email")}
                    className={`w-full h-11 px-3.5 border ${
                      emailErrors.email ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors`}
                  />
                  {emailErrors.email && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{emailErrors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 disabled:opacity-50 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {requestResetMutation.isPending ? (
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

            {/* Phase 2: Enter Code & Set New Password with react-hook-form */}
            {phase === 2 && (
              <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-4" noValidate>
                {/* 6-Digit Code */}
                <div>
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <KeyRound size={13} className="text-zinc-500 dark:text-zinc-400" />
                      <span>6-Digit Verification Code</span>
                    </span>
                    <button
                      type="button"
                      disabled={cooldown > 0 || isPending}
                      onClick={handleResendCode}
                      className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white disabled:opacity-50 cursor-pointer"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                    </button>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    disabled={isPending}
                    value={resetCode}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setResetValue("code", digits, { shouldValidate: true });
                    }}
                    className={`w-full h-11 px-3.5 text-center font-mono tracking-[6px] text-base font-bold border ${
                      resetErrors.code ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-800 rounded-xl text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors`}
                  />
                  {resetErrors.code && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{resetErrors.code.message}</p>
                  )}
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
                      placeholder="At least 6 characters"
                      disabled={isPending}
                      {...registerReset("newPassword")}
                      className={`w-full h-11 px-3.5 pr-10 border ${
                        resetErrors.newPassword ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                      } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {resetErrors.newPassword && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{resetErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                    <Lock size={13} className="text-zinc-500 dark:text-zinc-400" />
                    <span>Confirm New Password</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    disabled={isPending}
                    {...registerReset("confirmPassword")}
                    className={`w-full h-11 px-3.5 border ${
                      resetErrors.confirmPassword ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors`}
                  />
                  {resetErrors.confirmPassword && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{resetErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 disabled:opacity-50 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {confirmResetMutation.isPending ? (
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
              </form>
            )}

            {/* Phase 3: Success State */}
            {phase === 3 && (
              <div className="space-y-4 py-2 text-center animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <ShieldCheck size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Password Successfully Changed
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Your account password has been updated. You can now use your new password to log in.
                  </p>
                </div>
                <Link
                  href="/sign-in"
                  className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
