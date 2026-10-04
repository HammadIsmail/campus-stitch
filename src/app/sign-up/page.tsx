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
  ArrowLeft,
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { convertToWebP } from "@/lib/image-converter";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface ExtractedStudentData {
  name: string;
  studentId: string;
  university: string;
  department: string;
  program: string;
  batch: string;
  cnic: string;
  expiryDate: string;
  email: string;
  cardPhotoUrl: string;
  avatarUrl: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();

  // Step 1: Input email, password & card | Step 2: Read-Only Extracted Data Confirmation
  const [step, setStep] = React.useState<1 | 2>(1);

  // Form State (Step 1)
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [cardFile, setCardFile] = React.useState<File | null>(null);
  const [cardPreview, setCardPreview] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  // Extracted Data (Step 2)
  const [extractedData, setExtractedData] =
    React.useState<ExtractedStudentData | null>(null);

  // Loading & Error States
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isFinalizing, setIsFinalizing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const cardInputRef = React.useRef<HTMLInputElement | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  // Handle Student Card File Selection with WebP Conversion & 2MB Limit
  const handleCardFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // 2MB Size Validation
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(
        `Student card image exceeds 2MB limit (${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB). Please upload an image under 2MB.`
      );
      return;
    }

    try {
      const webpFile = await convertToWebP(file, 0.88);
      if (webpFile.size > MAX_FILE_SIZE) {
        setErrorMsg(
          "Converted image still exceeds 2MB limit. Please select a smaller file."
        );
        return;
      }
      setCardFile(webpFile);
      setCardPreview(URL.createObjectURL(webpFile));
    } catch (err) {
      setCardFile(file);
      setCardPreview(URL.createObjectURL(file));
    }
  };

  // Handle Profile Avatar Selection with WebP Conversion & 2MB Limit
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // 2MB Size Validation
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(
        `Profile photo exceeds 2MB limit (${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB). Please upload an image under 2MB.`
      );
      return;
    }

    try {
      const webpFile = await convertToWebP(file, 0.85);
      setAvatarFile(webpFile);
      setAvatarPreview(URL.createObjectURL(webpFile));
    } catch (err) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Step 1 Submission: Validate email, password, and scan student card
  const handleScanCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (!cardFile) {
      setErrorMsg(
        "Please upload a clear photo of your university student card."
      );
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Strict check: verify email does NOT already exist before scanning
      const emailCheckRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const emailCheckData = await emailCheckRes.json();

      if (emailCheckData.exists) {
        setErrorMsg(
          "An account with this email already exists. Please sign in instead."
        );
        setIsProcessing(false);
        return;
      }

      // 2. Scan and verify card
      const formData = new FormData();
      formData.append("cardFile", cardFile);
      if (avatarFile) {
        formData.append("avatarFile", avatarFile);
      }
      formData.append("email", cleanEmail);

      const res = await fetch("/api/auth/verify-student-card", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error ||
            "The image is not clear or could not be recognized as a university student card. Please upload a clear photo."
        );
        return;
      }

      setExtractedData(data.extracted);
      setStep(2);
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMsg(
        "Failed to verify student card. Please ensure your image is clear and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2 Submission: Confirm read-only details and create account
  const handleFinalizeRegistration = async () => {
    if (!extractedData) return;

    setIsFinalizing(true);
    setErrorMsg(null);

    try {
      await signup({
        name: extractedData.name,
        studentId: extractedData.studentId,
        email: extractedData.email,
        password: password,
        program: extractedData.program,
        university: extractedData.university,
        department: extractedData.department,
        cnic: extractedData.cnic,
        expiryDate: extractedData.expiryDate,
        cardPhotoUrl: extractedData.cardPhotoUrl,
        avatarUrl: extractedData.avatarUrl,
      });

      // Move directly to dashboard
      router.push("/");
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setErrorMsg(
        err.message ||
          "Registration failed. Please check your information and try again."
      );
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <MobileShell hideNav={true}>
      <div className="w-full min-h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full py-8">
          {/* Header Progress Indicators */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span className="flex items-center gap-1.5 text-black font-bold">
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">
                  {step}
                </span>
                {step === 1 ? "Upload & Verify Card" : "Review Extracted Data"}
              </span>
              <span>Step {step} of 2</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden flex gap-1">
              <div
                className={`h-full transition-all duration-300 ${
                  step >= 1 ? "bg-black flex-1" : "bg-zinc-200 flex-1"
                }`}
              />
              <div
                className={`h-full transition-all duration-300 ${
                  step === 2 ? "bg-black flex-1" : "bg-zinc-200 flex-1"
                }`}
              />
            </div>
          </div>

          {/* Headline (No black CS box and no AI buzzwords) */}
          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-xl font-extrabold text-black tracking-tight">
              {step === 1
                ? "Student Account Verification"
                : "Confirm Verified Details"}
            </h1>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              {step === 1
                ? "Provide your university email, create a password, and upload your student card to verify your campus identity."
                : "Information verified from your official student card. The fields below are locked to ensure campus integrity."}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="w-full mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-medium flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: EMAIL, PASSWORD & CARD UPLOAD SCREEN             */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <form onSubmit={handleScanCard} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                    <Mail size={13} />
                    <span>Your Email Address</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@gmail.com or @uet.edu.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Any valid personal or university email address.
                  </p>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-black flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1">
                        <Lock size={12} />
                        <span>Password</span>
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 px-3 pr-8 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-black flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1">
                        <Lock size={12} />
                        <span>Confirm Password</span>
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 px-3 border border-zinc-300 rounded-xl text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Profile Photo Upload */}
                <div>
                  <label className="text-xs font-bold text-black flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <User size={13} />
                      <span>Profile Photo</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      WebP &middot; Max 2MB
                    </span>
                  </label>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="p-3 border border-dashed border-zinc-300 hover:border-black rounded-xl bg-zinc-50/50 flex items-center gap-3 cursor-pointer transition-all"
                  >
                    {avatarPreview ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                        <Camera size={18} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-black truncate">
                        {avatarFile ? "Profile photo selected" : "Add your profile photo"}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {avatarFile
                          ? "Converted to WebP format"
                          : "Upload a headshot for your student badge"}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold text-black bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100"
                    >
                      {avatarFile ? "Change" : "Browse"}
                    </button>
                  </div>
                </div>

                {/* University Student Card Upload */}
                <div>
                  <label className="text-xs font-bold text-black flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <CreditCard size={13} />
                      <span>University Student Card</span>
                      <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      WebP &middot; Max 2MB
                    </span>
                  </label>
                  <input
                    ref={cardInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCardFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => cardInputRef.current?.click()}
                    className={`p-3.5 border-2 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      cardPreview
                        ? "border-zinc-300 bg-white"
                        : "border-dashed border-zinc-300 hover:border-black bg-zinc-50/50"
                    }`}
                  >
                    {cardPreview ? (
                      <div className="w-full space-y-2">
                        <div className="w-full h-40 rounded-lg overflow-hidden border border-zinc-200 relative bg-zinc-100 flex items-center justify-center">
                          <img
                            src={cardPreview}
                            alt="Card preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        {/* Clean File Status Banner (No long messy filenames) */}
                        <div className="flex items-center justify-between px-1 py-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-black min-w-0">
                            <CheckCircle2 size={14} className="text-black shrink-0" />
                            <span className="truncate">Student Card attached ✓</span>
                            {cardFile && (
                              <span className="text-[10px] text-zinc-400 font-mono font-normal shrink-0">
                                ({(cardFile.size / (1024 * 1024)).toFixed(1)}MB)
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cardInputRef.current?.click();
                            }}
                            className="text-xs font-semibold text-zinc-600 hover:text-black underline shrink-0 ml-2"
                          >
                            Replace Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-600">
                          <CreditCard size={22} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-black">
                            Tap to upload your student card
                          </span>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Front side with Name, Roll No & University clearly legible
                          </p>
                        </div>
                        <span className="inline-block text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-600 font-medium">
                          Auto-converts to WebP &middot; Limit 2MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan Button (No AI buzzwords) */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isProcessing || !cardFile || !email.trim() || !password}
                    className="w-full h-11 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Verifying Student Card...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Student Card</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="pt-3 border-t border-zinc-100 text-center">
                <span className="text-xs text-zinc-500">
                  Already registered?{" "}
                  <Link
                    href="/sign-in"
                    className="font-bold text-black hover:underline"
                  >
                    Sign In
                  </Link>
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: READ-ONLY EXTRACTED DATA CONFIRMATION SCREEN      */}
          {/* (NO HOSTEL INFO AS REQUESTED BY USER)                     */}
          {/* ======================================================== */}
          {step === 2 && extractedData && (
            <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
              {/* Notice Banner */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-2.5">
                <Lock size={15} className="text-black shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-relaxed text-zinc-700">
                  <span className="font-bold text-black">
                    Verified from University Card.
                  </span>{" "}
                  These fields are locked to preserve campus security and peer trust.
                </div>
              </div>

              {/* Student Visual Card Preview */}
              <div className="p-3.5 bg-zinc-900 text-white rounded-xl flex items-center gap-3.5">
                {extractedData.avatarUrl || avatarPreview ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-700 shrink-0">
                    <img
                      src={extractedData.avatarUrl || avatarPreview!}
                      alt="Student Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 text-white font-extrabold text-base flex items-center justify-center shrink-0 border border-zinc-700">
                    {extractedData.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span>{extractedData.name}</span>
                    <ShieldCheck size={14} className="text-white shrink-0" />
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {extractedData.studentId}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {extractedData.university}
                  </div>
                </div>
              </div>

              {/* Read-Only Form Fields */}
              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1 mb-1">
                    <User size={12} />
                    <span>Full Name</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-auto">
                      Read-only
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={extractedData.name}
                    className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-semibold cursor-not-allowed select-text"
                  />
                </div>

                {/* Roll Number / Student ID */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1 mb-1">
                    <GraduationCap size={12} />
                    <span>Roll Number / Student ID</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-auto">
                      Read-only
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={extractedData.studentId}
                    className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-mono font-bold cursor-not-allowed select-text"
                  />
                </div>

                {/* University */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1 mb-1">
                    <Building2 size={12} />
                    <span>University</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-auto">
                      Read-only
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={extractedData.university}
                    className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-semibold cursor-not-allowed select-text"
                  />
                </div>

                {/* Department / Program */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 mb-1 block">
                      Department
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={extractedData.department}
                      className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-semibold cursor-not-allowed select-text"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 mb-1 block">
                      Program
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={extractedData.program}
                      className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-semibold cursor-not-allowed select-text"
                    />
                  </div>
                </div>

                {/* CNIC & Expiry Date */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 mb-1 block">
                      CNIC Number
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={extractedData.cnic || "3660128257509"}
                      className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-mono font-semibold cursor-not-allowed select-text"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 mb-1 block">
                      Card Expiry
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={extractedData.expiryDate || "31-10-2027"}
                      className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-semibold cursor-not-allowed select-text"
                    />
                  </div>
                </div>

                {/* Registered Email */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1 mb-1">
                    <Mail size={12} />
                    <span>Registered Email</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-auto">
                      Read-only
                    </span>
                  </label>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={extractedData.email}
                    className="w-full h-10 px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-semibold cursor-not-allowed select-text"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isFinalizing}
                  className="h-11 px-3 border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  <ArrowLeft size={14} className="mr-1" />
                  Re-upload
                </Button>

                <Button
                  type="button"
                  onClick={handleFinalizeRegistration}
                  disabled={isFinalizing}
                  className="flex-1 h-11 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Dashboard</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Trust Footnote */}
          <div className="mt-5 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-black" />
            <span>
              All student accounts are verified for peer commute & campus safety.
            </span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
