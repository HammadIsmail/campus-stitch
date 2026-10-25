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
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useSignInMutation } from "@/hooks/use-auth-queries";
import { useAuth } from "@/lib/auth-context";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .transform((val) => val.trim().toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const { refreshAuth } = useAuth();

  const signInMutation = useSignInMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setFormError(null);

    signInMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: async (result) => {
          if (result.success && result.user) {
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "campus_stitch_current_user",
                JSON.stringify(result.user)
              );
            }
            await refreshAuth();

            const params = new URLSearchParams(window.location.search);
            let redirectTarget = params.get("redirect");

            if (!redirectTarget || redirectTarget === "/") {
              if (result.user.role === "super_admin") {
                redirectTarget = "/admin/super";
              } else if (result.user.role === "campus_admin") {
                redirectTarget = "/admin";
              } else {
                redirectTarget = "/commute";
              }
            }

            router.push(redirectTarget || "/commute");
          } else {
            setFormError(result.message || "Failed to sign in. Please verify your credentials.");
          }
        },
        onError: (err: any) => {
          setFormError(err.message || "Failed to sign in. Please check your credentials.");
        },
      }
    );
  };

  const isPending = signInMutation.isPending;

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

          {/* Form / API Error Message */}
          {formError && (
            <div className="w-full mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-900 dark:text-red-300 font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="leading-relaxed font-semibold">{formError}</div>
                {formError.toLowerCase().includes("invalid") && (
                  <div className="text-[11px] pt-0.5">
                    <Link
                      href="/sign-up"
                      className="underline font-bold hover:text-black dark:hover:text-white"
                    >
                      Don&apos;t have an account yet? Create one here &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sign In Form with react-hook-form */}
          <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                  <Mail size={13} className="text-zinc-500 dark:text-zinc-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com or @uet.edu.pk"
                  disabled={isPending}
                  {...register("email")}
                  className={`w-full h-11 px-3.5 border ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-950 dark:focus:border-zinc-400"
                  } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none transition-colors`}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
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
                    placeholder="Enter your password"
                    disabled={isPending}
                    {...register("password")}
                    className={`w-full h-11 px-3.5 pr-10 border ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-950 dark:focus:border-zinc-400"
                    } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
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
