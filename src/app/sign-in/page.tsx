"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const { login } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect") || "/";
      window.location.href = redirectTarget;
    } catch (err: any) {
      setErrorMsg(
        err.message || "Failed to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell hideNav={true}>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-sm mx-auto w-full py-8">
          {/* Headline (No black CS box and no buzzwords) */}
          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-xl font-extrabold text-black tracking-tight">
              Sign In to CampuStitch
            </h1>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              UET Lahore Student Platform. Enter your email and password to access your account.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-medium flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Sign In Form */}
          <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                  <Mail size={13} />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com or @uet.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-black flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Lock size={13} />
                    <span>Password</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full h-11 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-3 border-t border-zinc-100 text-center">
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

          {/* Trust Footnote */}
          <div className="mt-5 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-black" />
            <span>Campus card verification required for all students.</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
