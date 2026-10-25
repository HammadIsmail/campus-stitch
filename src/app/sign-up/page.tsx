"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  User,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Search,
  Check,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { SUPPORTED_UNIVERSITIES, UniversityItem } from "@/lib/universities";
import {
  useUniversitiesQuery,
  useDepartmentsQuery,
  useCheckEmailMutation,
  useSendOtpMutation,
  useSignUpMutation,
} from "@/hooks/use-auth-queries";

// Curated list of departments fed by the system
export const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Data Science & AI",
  "Cyber Security",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Mechatronics Engineering",
  "Biomedical Engineering",
  "Business Administration (BBA)",
  "Accounting & Finance",
  "Management Sciences",
  "Architecture & Design",
  "Mathematics & Computing",
  "Physics & Applied Sciences",
  "Social Sciences & Humanities",
];

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters.")
      .transform((val) => val.trim()),
    universityId: z.string().min(1, "Please select a university."),
    universityName: z.string().min(1, "University name is required."),
    campusId: z.string().min(1, "Please select a campus."),
    campusName: z.string().min(1, "Campus name is required."),
    department: z.string().min(1, "Please select your department."),
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Please enter a valid email address.")
      .transform((val) => val.trim().toLowerCase()),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const otpSchema = z.object({
  otpCode: z
    .string()
    .length(6, "Verification code must be exactly 6 digits.")
    .regex(/^\d{6}$/, "Code must contain only digits."),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  // Step 1: Student Information Form | Step 2: 6-Digit Email OTP Verification
  const [step, setStep] = React.useState<1 | 2>(1);

  // TanStack Query Router Hooks (Replaces direct fetch)
  const { data: universitiesList = SUPPORTED_UNIVERSITIES } = useUniversitiesQuery();
  const { data: departmentsList = DEPARTMENTS } = useDepartmentsQuery();
  const checkEmailMutation = useCheckEmailMutation();
  const sendOtpMutation = useSendOtpMutation();
  const signUpMutation = useSignUpMutation();

  // React Hook Form for Step 1
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      universityId: SUPPORTED_UNIVERSITIES[0].id,
      universityName: SUPPORTED_UNIVERSITIES[0].name,
      campusId: "camp_uet_main",
      campusName: SUPPORTED_UNIVERSITIES[0].campuses[0] || "Main Campus (Lahore)",
      department: DEPARTMENTS[0],
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // React Hook Form for Step 2 (OTP)
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    setValue: setOtpValue,
    watch: watchOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otpCode: "",
    },
  });

  const selectedUniId = watch("universityId");
  const selectedCampusId = watch("campusId");
  const currentEmail = watch("email");
  const otpCode = watchOtp("otpCode");

  // Local UI helpers
  const [showPassword, setShowPassword] = React.useState(false);
  const [uniSearchQuery, setUniSearchQuery] = React.useState("");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(60);
  const [resendFeedback, setResendFeedback] = React.useState<string | null>(null);
  const [globalErrorMsg, setGlobalErrorMsg] = React.useState<string | null>(null);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Current selected university object
  const selectedUni = React.useMemo(() => {
    return (
      universitiesList.find((u: any) => u.id === selectedUniId) ||
      universitiesList[0] ||
      SUPPORTED_UNIVERSITIES[0]
    );
  }, [universitiesList, selectedUniId]);

  // Sync initial campus if university changes
  const handleSelectUniversity = (uni: any) => {
    setValue("universityId", uni.id);
    setValue("universityName", uni.name);
    const camps = uni.campuses || [];
    if (camps.length > 0) {
      const first = camps[0];
      setValue("campusId", typeof first === "string" ? first : first.id);
      setValue("campusName", typeof first === "string" ? first : first.name);
    } else {
      setValue("campusId", `${uni.id}_main`);
      setValue("campusName", uni.city || "Main Campus");
    }
    setIsUniDropdownOpen(false);
    setUniSearchQuery("");
  };

  // Close university dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUniDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered universities
  const filteredUniversities = React.useMemo(() => {
    if (!uniSearchQuery.trim()) return universitiesList;
    const q = uniSearchQuery.toLowerCase().trim();
    return universitiesList.filter((item: any) => {
      const camps = Array.isArray(item.campuses) ? item.campuses : [];
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q) ||
        (item.city && item.city.toLowerCase().includes(q)) ||
        camps.some((c: any) =>
          typeof c === "string" ? c.toLowerCase().includes(q) : c.name.toLowerCase().includes(q)
        )
      );
    });
  }, [uniSearchQuery, universitiesList]);

  // Resend OTP countdown
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCooldown]);

  // Step 1: Submit with react-hook-form + TanStack Query Mutations
  const onProceedToOtp = async (data: SignUpFormData) => {
    setGlobalErrorMsg(null);

    // 1. Check if email already registered via query mutation
    checkEmailMutation.mutate(
      { email: data.email },
      {
        onSuccess: (checkData) => {
          if (checkData.exists) {
            setGlobalErrorMsg("An account with this email already exists. Please sign in.");
            return;
          }

          // 2. Send 6-digit OTP code to email via query mutation
          sendOtpMutation.mutate(
            { email: data.email },
            {
              onSuccess: (otpData) => {
                if (otpData.success) {
                  setStep(2);
                  setResendCooldown(60);
                  setResendFeedback("A 6-digit verification code was sent to your email.");
                } else {
                  setGlobalErrorMsg(otpData.message || "Failed to send verification code.");
                }
              },
              onError: (err: any) => {
                setGlobalErrorMsg(err.message || "Failed to send verification code.");
              },
            }
          );
        },
        onError: (err: any) => {
          setGlobalErrorMsg(err.message || "Failed to verify email address.");
        },
      }
    );
  };

  // Resend OTP via TanStack Query Mutation
  const handleResendOtp = () => {
    const cleanEmail = currentEmail.trim().toLowerCase();
    if (resendCooldown > 0 || sendOtpMutation.isPending || !cleanEmail) return;

    setGlobalErrorMsg(null);
    setResendFeedback(null);

    sendOtpMutation.mutate(
      { email: cleanEmail },
      {
        onSuccess: (data) => {
          if (data.success) {
            setResendCooldown(60);
            setResendFeedback("New 6-digit code sent to your email.");
          } else {
            setGlobalErrorMsg(data.message || "Failed to resend code.");
          }
        },
        onError: () => {
          setGlobalErrorMsg("Failed to resend code. Please try again.");
        },
      }
    );
  };

  // Step 2: Finalize signup with OTP code via SignUp Mutation
  const onCompleteSignUp = (otpData: OtpFormData) => {
    setGlobalErrorMsg(null);

    const formValues = watch();

    signUpMutation.mutate(
      {
        name: formValues.fullName,
        studentId: "",
        email: formValues.email,
        password: formValues.password,
        code: otpData.otpCode,
        university: selectedUni.name || selectedUni.shortName,
        universityId: selectedUni.id,
        campusId: formValues.campusId,
        campusName: formValues.campusName,
        city: formValues.campusName,
        department: formValues.department,
        program: `BS ${formValues.department}`,
      },
      {
        onSuccess: async (res) => {
          if (res.success && res.user) {
            if (typeof window !== "undefined") {
              localStorage.setItem("campus_stitch_current_user", JSON.stringify(res.user));
              localStorage.setItem("campus_stitch_show_verify_prompt", "true");
            }
            await refreshAuth();
            router.push("/");
          } else {
            setGlobalErrorMsg(res.message || "Failed to create account. Please check your verification code.");
          }
        },
        onError: (err: any) => {
          setGlobalErrorMsg(err.message || "Failed to create account. Please check your verification code.");
        },
      }
    );
  };

  const isStep1Pending = checkEmailMutation.isPending || sendOtpMutation.isPending;
  const isFinalizing = signUpMutation.isPending;
  const isEmailExisting = Boolean(globalErrorMsg?.toLowerCase().includes("already exists"));

  return (
    <MobileShell hideNav>
      <div className="min-h-screen px-4 py-8 max-w-md mx-auto flex flex-col justify-center">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="CampuStitch"
            className="w-14 h-14 rounded-2xl mx-auto mb-3 shadow-md object-cover"
          />
          <h1 className="text-2xl font-black tracking-tight text-black dark:text-white">
            {step === 1 ? "Create Student Account" : "Verify Your Email"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {step === 1
              ? "Join Campus Stitch. Select your university & city to get started."
              : `Enter the 6-digit code sent to ${currentEmail}`}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step >= 1 ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step === 2 ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />
        </div>

        {/* Global Error Alert */}
        {globalErrorMsg && (
          <div
            className={`mb-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
              isEmailExisting
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200"
            }`}
          >
            <AlertCircle
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isEmailExisting
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            />
            <div className="flex-1 space-y-2">
              <div className="font-semibold leading-relaxed">{globalErrorMsg}</div>
              {isEmailExisting && (
                <div className="pt-0.5">
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 transition-opacity"
                  >
                    <span>Sign In to Your Account</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resend Feedback */}
        {resendFeedback && (
          <div className="mb-5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{resendFeedback}</span>
          </div>
        )}

        {/* STEP 1: Registration Form with react-hook-form */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onProceedToOtp)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Full Name <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Ali Ahmed"
                  disabled={isStep1Pending}
                  {...register("fullName")}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                    errors.fullName ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                  } rounded-xl text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* University Searchable Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                University <span className="text-zinc-400">*</span>
              </label>
              <button
                type="button"
                disabled={isStep1Pending}
                onClick={() => setIsUniDropdownOpen((prev) => !prev)}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-left text-sm flex items-center justify-between focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer"
              >
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <span className="truncate font-semibold text-black dark:text-white">
                  {selectedUni.shortName} — {selectedUni.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                    isUniDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUniDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden max-h-60 flex flex-col animate-in fade-in-50 zoom-in-95">
                  <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 sticky top-0">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search university..."
                        value={uniSearchQuery}
                        onChange={(e) => setUniSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 py-1">
                    {filteredUniversities.length === 0 ? (
                      <div className="p-3 text-center text-xs text-zinc-400">
                        No matching universities found
                      </div>
                    ) : (
                      filteredUniversities.map((uni: any) => {
                        const isSelected = selectedUni.id === uni.id;
                        return (
                          <button
                            key={uni.id}
                            type="button"
                            onClick={() => handleSelectUniversity(uni)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                                : "text-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            <div className="pr-2 truncate">
                              <div className="font-bold truncate">{uni.shortName}</div>
                              <div
                                className={`text-[11px] truncate ${
                                  isSelected ? "opacity-80" : "text-zinc-500 dark:text-zinc-400"
                                }`}
                              >
                                {uni.name}
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Campus / City Dropdown */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Campus <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select
                  value={selectedCampusId}
                  disabled={isStep1Pending}
                  onChange={(e) => {
                    const val = e.target.value;
                    setValue("campusId", val);
                    const campObj = (selectedUni.campuses || []).find((c: any) =>
                      typeof c === "string" ? c === val : c.id === val
                    );
                    if (campObj) {
                      setValue("campusName", typeof campObj === "string" ? campObj : campObj.name);
                    }
                  }}
                  className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-all cursor-pointer font-semibold"
                >
                  {(selectedUni.campuses || []).map((camp: any) => {
                    const cid = typeof camp === "string" ? camp : camp.id;
                    const cname = typeof camp === "string" ? camp : `${camp.name} · ${camp.city}`;
                    return (
                      <option key={cid} value={cid} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
                        {cname}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Department / Program Dropdown */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Department / Program <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select
                  disabled={isStep1Pending}
                  {...register("department")}
                  className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-all cursor-pointer font-semibold"
                >
                  {departmentsList.map((dept: string) => (
                    <option key={dept} value={dept} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Email Address <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  disabled={isStep1Pending}
                  {...register("email")}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl text-sm text-black dark:text-white focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                    errors.email || isEmailExisting
                      ? "border-red-500 focus:border-red-500 ring-2 ring-red-500/20"
                      : "border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.email.message}</p>
              )}
              {isEmailExisting ? (
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1.5">
                  <span>This email is already registered.</span>
                  <Link href="/sign-in" className="underline font-black hover:text-black dark:hover:text-white">
                    Sign in here &rarr;
                  </Link>
                </p>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  You can use any valid email. A 6-digit code will be sent to verify.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Password <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  disabled={isStep1Pending}
                  {...register("password")}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border ${
                    errors.password ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                  } rounded-xl text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Confirm Password <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  disabled={isStep1Pending}
                  {...register("confirmPassword")}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                    errors.confirmPassword ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                  } rounded-xl text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isStep1Pending}
              className="w-full h-11 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold text-xs shadow-xs mt-2 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isStep1Pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: Email OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleSubmitOtp(onCompleteSignUp)} className="space-y-5 animate-in fade-in" noValidate>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
              <Mail className="w-6 h-6 text-black dark:text-white mx-auto mb-2" />
              <div className="text-xs text-zinc-500 dark:text-zinc-400">We sent a verification code to:</div>
              <div className="text-sm font-bold text-black dark:text-white mt-0.5 break-all">{currentEmail}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="123456"
                disabled={isFinalizing}
                value={otpCode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpValue("otpCode", cleaned, { shouldValidate: true });
                }}
                className={`w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3 bg-white dark:bg-zinc-900 border ${
                  otpErrors.otpCode ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                } rounded-xl text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all`}
              />
              {otpErrors.otpCode && (
                <p className="mt-1.5 text-center text-[11px] text-red-500 font-medium">
                  {otpErrors.otpCode.message}
                </p>
              )}
            </div>

            {/* Resend Code Button & Countdown */}
            <div className="text-center text-xs">
              {resendCooldown > 0 ? (
                <span className="text-zinc-500 dark:text-zinc-400">
                  Resend code in <strong className="text-black dark:text-white">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="text-black dark:text-white font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {sendOtpMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Resend Verification Code
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={isFinalizing || (otpCode || "").length !== 6}
                className="w-full h-11 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isFinalizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Registration
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setGlobalErrorMsg(null);
                  setResendFeedback(null);
                }}
                disabled={isFinalizing}
                className="w-full py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Registration Details
              </button>
            </div>
          </form>
        )}

        {/* Sign In link */}
        <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-3">
          <div>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-black dark:text-white font-bold hover:underline">
              Sign In
            </Link>
          </div>

          <div className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
            By registering, you agree to CampuStitch&apos;s{" "}
            <Link href="/terms" className="underline font-bold text-black dark:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline font-bold text-black dark:text-white">
              Privacy Policy
            </Link>
            .
          </div>

          <div>
            <Link
              href="/home"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              &larr; Back to CampuStitch Homepage
            </Link>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
