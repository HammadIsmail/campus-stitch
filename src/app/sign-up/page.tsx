"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  GraduationCap,
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
  Camera,
  BookOpen,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { convertToWebP } from "@/lib/image-converter";
import { SUPPORTED_UNIVERSITIES, UniversityItem } from "@/lib/universities";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();

  // Step 1: Student Information Form | Step 2: 6-Digit Email OTP Verification
  const [step, setStep] = React.useState<1 | 2>(1);

  // Form Fields
  const [fullName, setFullName] = React.useState("");
  const [selectedUni, setSelectedUni] = React.useState<UniversityItem>(SUPPORTED_UNIVERSITIES[0]);
  const [uniSearchQuery, setUniSearchQuery] = React.useState("");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = React.useState(false);
  const [selectedCampusCity, setSelectedCampusCity] = React.useState<string>(SUPPORTED_UNIVERSITIES[0].campuses[0] || "Lahore");
  const [studentId, setStudentId] = React.useState("");
  const [department, setDepartment] = React.useState("Computer Science");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Optional avatar
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  // OTP State
  const [otpCode, setOtpCode] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(60);
  const [isResending, setIsResending] = React.useState(false);
  const [resendFeedback, setResendFeedback] = React.useState<string | null>(null);

  // State indicators
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isFinalizing, setIsFinalizing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  // Update selected city if university changes
  const handleSelectUniversity = (uni: UniversityItem) => {
    setSelectedUni(uni);
    setSelectedCampusCity(uni.campuses[0] || uni.city);
    setIsUniDropdownOpen(false);
    setUniSearchQuery("");
  };

  // Filtered universities
  const filteredUniversities = React.useMemo(() => {
    if (!uniSearchQuery.trim()) return SUPPORTED_UNIVERSITIES;
    const q = uniSearchQuery.toLowerCase().trim();
    return SUPPORTED_UNIVERSITIES.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.campuses.some((c) => c.toLowerCase().includes(q))
    );
  }, [uniSearchQuery]);

  // Resend OTP countdown
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCooldown]);

  // Avatar file handling
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg("Profile photo must be under 2MB.");
      return;
    }

    try {
      const webpFile = await convertToWebP(file, 0.85);
      setAvatarFile(webpFile);
      setAvatarPreview(URL.createObjectURL(webpFile));
    } catch {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Step 1 Submit: Validate and send OTP to email
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = fullName.trim();
    const cleanId = studentId.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!cleanId) {
      setErrorMsg("Please enter your Student Roll Number / ID.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Check if email already registered
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setErrorMsg("An account with this email already exists. Please sign in.");
        setIsProcessing(false);
        return;
      }

      // 2. Send 6-digit OTP code to the email
      const otpRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData.success) {
        setErrorMsg(otpData.message || "Failed to send verification code. Please check your email.");
        setIsProcessing(false);
        return;
      }

      // Proceed to Step 2
      setStep(2);
      setResendCooldown(60);
      setResendFeedback("A 6-digit verification code was sent to your email.");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (resendCooldown > 0 || isResending || !cleanEmail) return;

    setIsResending(true);
    setErrorMsg(null);
    setResendFeedback(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to resend code.");
      } else {
        setResendCooldown(60);
        setResendFeedback("New 6-digit code sent to your email.");
      }
    } catch {
      setErrorMsg("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Step 2 Submit: Finalize registration with OTP
  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setIsFinalizing(true);
    setErrorMsg(null);

    try {
      // Optional upload avatar if provided
      let uploadedAvatarUrl: string | undefined = undefined;
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("file", avatarFile);
        try {
          const upRes = await fetch("/api/upload", {
            method: "POST",
            body: avatarFormData,
          });
          const upData = await upRes.json();
          if (upData.url) {
            uploadedAvatarUrl = upData.url;
          }
        } catch {
          // Non-critical if avatar upload fails
        }
      }

      const success = await signup({
        name: fullName.trim(),
        studentId: studentId.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password,
        code: otpCode.trim(),
        university: selectedUni.name,
        city: selectedCampusCity,
        department: department.trim(),
        program: `BS ${department.trim()}`,
        avatarUrl: uploadedAvatarUrl,
      });

      if (success) {
        // Set flag to prompt the one-time unverified dialog on home page
        if (typeof window !== "undefined") {
          localStorage.setItem("campus_stitch_show_verify_prompt", "true");
        }
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please check your verification code.");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <MobileShell hideNav>
      <div className="min-h-screen px-4 py-8 max-w-md mx-auto flex flex-col justify-center">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20 shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {step === 1 ? "Create Student Account" : "Verify Your Email"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {step === 1
              ? "Join Campus Stitch. Select your university & city to get started."
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step >= 1 ? "bg-emerald-500" : "bg-muted"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step === 2 ? "bg-emerald-500" : "bg-muted"
            }`}
          />
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-2.5 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Resend Feedback */}
        {resendFeedback && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{resendFeedback}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleProceedToOtp} className="space-y-4">
            {/* Optional Avatar */}
            <div className="flex justify-center mb-2">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="relative group cursor-pointer w-20 h-20 rounded-full border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-muted/40 flex flex-col items-center justify-center overflow-hidden transition-all"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground group-hover:text-emerald-500">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-medium">Photo</span>
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* University Searchable Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                University <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsUniDropdownOpen((prev) => !prev)}
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-left text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <span className="truncate font-medium text-foreground">
                  {selectedUni.shortName} — {selectedUni.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                    isUniDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUniDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-60 flex flex-col animate-in fade-in-50 zoom-in-95">
                  <div className="p-2 border-b border-border bg-muted/20 sticky top-0">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search university..."
                        value={uniSearchQuery}
                        onChange={(e) => setUniSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto divide-y divide-border/50 py-1">
                    {filteredUniversities.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        No matching universities found
                      </div>
                    ) : (
                      filteredUniversities.map((uni) => {
                        const isSelected = selectedUni.id === uni.id;
                        return (
                          <button
                            key={uni.id}
                            type="button"
                            onClick={() => handleSelectUniversity(uni)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-500/10 transition-colors ${
                              isSelected ? "bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400" : "text-foreground"
                            }`}
                          >
                            <div className="pr-2 truncate">
                              <div className="font-semibold truncate">{uni.shortName}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{uni.name}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Campus / City Dropdown (City Names Only) */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Campus City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCampusCity}
                  onChange={(e) => setSelectedCampusCity(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all cursor-pointer font-medium text-foreground"
                >
                  {selectedUni.campuses.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Student Roll No / ID */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Student Roll No / ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 2022-CS-101"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase transition-all placeholder:text-muted-foreground/60 font-mono"
                />
              </div>
            </div>

            {/* Department / Program */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Department / Program <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Email Address (Any standard email: Gmail, Outlook, Yahoo, etc.) */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                You can use any valid email (Gmail, Outlook, Yahoo, etc.). A 6-digit code will be sent to verify.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 mt-2 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
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
          <form onSubmit={handleCompleteSignUp} className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl bg-muted/40 border border-border text-center">
              <Mail className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground">We sent a verification code to:</div>
              <div className="text-sm font-semibold text-foreground mt-0.5 break-all">{email}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Resend Code Button & Countdown */}
            <div className="text-center text-xs">
              {resendCooldown > 0 ? (
                <span className="text-muted-foreground">
                  Resend code in <strong className="text-foreground">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {isResending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Resend Verification Code
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={isFinalizing || otpCode.length !== 6}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
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
                  setErrorMsg(null);
                  setResendFeedback(null);
                }}
                disabled={isFinalizing}
                className="w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Registration Details
              </button>
            </div>
          </form>
        )}

        {/* Sign In link */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}
