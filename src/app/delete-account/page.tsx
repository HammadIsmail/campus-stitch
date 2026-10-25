"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Smartphone,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { useAuth } from "@/lib/auth-context";
import { useSignInMutation } from "@/hooks/use-auth-queries";
import { useDeleteAccountMutation } from "@/hooks/use-profile-queries";

const deleteAccountSchema = z.object({
  email: z.string().email("Please enter a valid university email address."),
  studentId: z.string().min(1, "Student ID or Roll Number is required."),
  password: z.string().min(1, "Account password is required for security."),
  reason: z.string().optional(),
  confirmUnderstood: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you understand account deletion is permanent.",
  }),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

export default function DeleteAccountPage() {
  const { user: authUser, logout } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const signInMutation = useSignInMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      email: authUser?.email || "",
      studentId: authUser?.studentId || "",
      password: "",
      reason: "",
      confirmUnderstood: false,
    },
  });

  // Sync if auth state changes
  React.useEffect(() => {
    if (authUser?.email) setValue("email", authUser.email);
    if (authUser?.studentId) setValue("studentId", authUser.studentId);
  }, [authUser, setValue]);

  const onSubmit = (data: DeleteAccountFormData) => {
    setErrorMsg(null);

    // 1. Security Check: Verify password belongs to this account
    signInMutation.mutate(
      {
        email: data.email.trim().toLowerCase(),
        password: data.password.trim(),
      },
      {
        onSuccess: (authData) => {
          if (!authData.success) {
            setErrorMsg("Security Verification Failed: The password provided is incorrect.");
            return;
          }

          // 2. Perform permanent deletion via mutation
          deleteAccountMutation.mutate(
            {
              email: data.email.trim().toLowerCase(),
              password: data.password.trim(),
              reason: data.reason?.trim(),
            },
            {
              onSuccess: async () => {
                if (authUser) {
                  try {
                    await logout();
                    localStorage.clear();
                  } catch {}
                }
                setSubmitted(true);
              },
              onError: (err: any) => {
                setErrorMsg(err.message || "Failed to process deletion request. Please try again.");
              },
            }
          );
        },
        onError: () => {
          setErrorMsg("Security Verification Failed: The password provided is incorrect.");
        },
      }
    );
  };

  const isSubmitting = signInMutation.isPending || deleteAccountMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNav />

      {/* Header Banner */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <Trash2 size={13} />
            <span>Google Play Policy & GDPR Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Delete CampuStitch Account & Data
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            In compliance with Google Play Store User Data &amp; Account Deletion policies, you can request the permanent deletion of your CampuStitch student account and all associated personal data directly from this portal or from within the mobile app.
          </p>
        </div>
      </section>

      {/* Content Form and Info */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Policy Summary Callout */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-white">
                What happens when you delete your account?
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Deletion is permanent and irreversible. Once your request is processed:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Personal Profile</span>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                Your name, student ID, university email, phone number, and uploaded student card images are permanently purged.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Listings &amp; Rides</span>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                All marketplace items, active ride offers, bike listings, and roommate posts authored by you are removed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Authentication</span>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                Your sign-in credentials, active tokens, and device push tokens are revoked across web and mobile apps.
              </p>
            </div>
          </div>
        </div>

        {/* Deletion Form Container with react-hook-form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                Account Successfully Deleted
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                Your account and all associated personal data have been purged from CampuStitch databases in accordance with our data retention policy.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  <span>Return to Homepage</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Web Deletion Request Form
              </h2>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-900 dark:text-red-300 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Registered University Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="student@uet.edu.pk or gmail.com"
                    disabled={isSubmitting}
                    {...register("email")}
                    className={`w-full h-11 px-3.5 border ${
                      errors.email ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Student ID / Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2022-CS-101"
                    disabled={isSubmitting}
                    {...register("studentId")}
                    className={`w-full h-11 px-3.5 border ${
                      errors.studentId ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors`}
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.studentId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Account Password <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Required to verify account ownership
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your account password"
                    disabled={isSubmitting}
                    {...register("password")}
                    className={`w-full h-11 pl-10 pr-10 border ${
                      errors.password ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors`}
                  />
                  <div className="absolute left-3.5 top-3 text-zinc-400">
                    <KeyRound size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Security Notice */}
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <ShieldCheck size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Tampering Protection:</strong> For your security, account deletion strictly requires password authentication. A third party cannot delete your account simply by entering your public email or student roll number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                  Reason for Leaving (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Graduated, transferred to another university, or no longer needing campus services..."
                  disabled={isSubmitting}
                  {...register("reason")}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 space-y-1">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirm"
                    disabled={isSubmitting}
                    {...register("confirmUnderstood")}
                    className="mt-1 w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="confirm" className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed cursor-pointer font-medium">
                    I understand that this action is permanent. All my active rides, marketplace listings, verification records, and account credentials will be erased immediately.
                  </label>
                </div>
                {errors.confirmUnderstood && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium pl-7">
                    {errors.confirmUnderstood.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying &amp; Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Permanently Delete My Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
