"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { SubmitButton } from "@/components/ui/submit-button";
import { useAuth } from "@/lib/auth-context";

interface SignInState {
  error: string | null;
}

export default function SignInPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const { login } = useAuth();

  // Modern React 19 Form Action State hook
  // Official doc: https://react.dev/reference/react/useActionState
  const [state, formAction] = useActionState<SignInState, FormData>(
    async (_prevState, formData) => {
      const email = formData.get("email")?.toString().trim().toLowerCase() || "";
      const password = formData.get("password")?.toString().trim() || "";

      if (!email || !password) {
        return { error: "Please enter both email and password." };
      }

      try {
        await login({
          email,
          password,
        });

        const params = new URLSearchParams(window.location.search);
        let redirectTarget = params.get("redirect");

        if (!redirectTarget || redirectTarget === "/") {
          try {
            const userStr = localStorage.getItem("campus_stitch_current_user");
            if (userStr) {
              const u = JSON.parse(userStr);
              if (u.role === "super_admin") redirectTarget = "/admin/super";
              else if (u.role === "campus_admin") redirectTarget = "/admin";
              else redirectTarget = "/commute";
            }
          } catch {}
        }

        window.location.href = redirectTarget || "/commute";
        return { error: null };
      } catch (err: any) {
        return {
          error: err.message || "Failed to sign in. Please check your credentials.",
        };
      }
    },
    { error: null }
  );

  return (
    <MobileShell hideNav={true}>
      <div className="w-full min-h-full flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-sm mx-auto w-full py-8">
          {/* Headline */}
          <div className="text-center space-y-1.5 mb-6">
            <img
              src="/logo.png"
              alt="CampuStitch"
              className="w-14 h-14 rounded-2xl mx-auto mb-3 shadow-md object-cover"
            />
            <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Sign In to CampuStitch
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              Enter your email and password to access your account.
            </p>
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="w-full mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-900 dark:text-red-300 font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="leading-relaxed font-semibold">{state.error}</div>
                {state.error.toLowerCase().includes("invalid") && (
                  <div className="text-[11px] pt-0.5">
                    <Link href="/sign-up" className="underline font-bold hover:text-black dark:hover:text-white">
                      Don&apos;t have an account yet? Create one here &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
            <form action={formAction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                  <Mail size={13} className="text-zinc-500 dark:text-zinc-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. yourname@gmail.com or @uet.edu.pk"
                  defaultValue=""
                  className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Lock size={13} className="text-zinc-500 dark:text-zinc-400" />
                    <span>Password</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Enter your password"
                    defaultValue=""
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

              <SubmitButton
                pendingText="Signing in..."
                icon={<ArrowRight size={14} />}
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 shadow-xs"
              >
                Sign In
              </SubmitButton>
            </form>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-bold text-zinc-950 dark:text-white hover:underline"
                >
                  Create Student Account
                </Link>
              </span>
            </div>
          </div>

          {/* Back to Home & Legal Links */}
          <div className="mt-5 text-center space-y-2">
            <Link
              href="/home"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              &larr; Back to CampuStitch Homepage
            </Link>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5 flex-wrap">
              <span>By signing in, you agree to our</span>
              <Link href="/terms" className="underline hover:text-black dark:hover:text-white">
                Terms
              </Link>
              <span>&amp;</span>
              <Link href="/privacy" className="underline hover:text-black dark:hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
