"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Upload,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Building2,
  MapPin,
  GraduationCap,
  X,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { convertToWebP } from "@/lib/image-converter";
import { SUPPORTED_UNIVERSITIES } from "@/lib/universities";

export default function VerifyKycPage() {
  const router = useRouter();
  const { user: authUser, refreshAuth } = useAuth();

  // Dynamic user fields (pre-filled from authenticated user)
  const [name, setName] = React.useState(authUser?.name || "");
  const [studentId, setStudentId] = React.useState(authUser?.studentId || "");
  const [university, setUniversity] = React.useState("UET Lahore");
  const [city, setCity] = React.useState("Lahore");
  const [program, setProgram] = React.useState(authUser?.program || "BS Computer Science");
  const [department, setDepartment] = React.useState("Computer Science");

  // Step 1: Live Selfie (Binance style KYC) | Step 2: Student Card Upload | Step 3: Confirmation
  const [step, setStep] = React.useState<1 | 2>(1);

  // Live Camera Selfie State
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [liveSelfieBlob, setLiveSelfieBlob] = React.useState<Blob | null>(null);
  const [liveSelfiePreview, setLiveSelfiePreview] = React.useState<string | null>(null);
  const [isUploadingSelfie, setIsUploadingSelfie] = React.useState(false);

  // Student Card State
  const [cardFile, setCardFile] = React.useState<File | null>(null);
  const [cardPreview, setCardPreview] = React.useState<string | null>(null);
  const [isUploadingCard, setIsUploadingCard] = React.useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const cardInputRef = React.useRef<HTMLInputElement | null>(null);
  const selfieUploadInputRef = React.useRef<HTMLInputElement | null>(null);

  // Synchronize auth user details when loaded
  React.useEffect(() => {
    if (authUser) {
      if (authUser.name && !name) setName(authUser.name);
      if (authUser.studentId && !studentId) setStudentId(authUser.studentId);
      if (authUser.program && !program) setProgram(authUser.program);
    }
  }, [authUser, name, studentId, program]);

  // Start Webcam stream for Binance KYC
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError("Camera access is not supported by your browser. Please upload a clear selfie instead.");
      }
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        "Camera permission was denied or not available. You can upload a clear photo of your face below."
      );
      setIsCameraActive(false);
    }
  };

  // Stop Webcam stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture Live Selfie from Video Stream
  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally for natural mirror selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          setLiveSelfieBlob(blob);
          setLiveSelfiePreview(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      "image/webp",
      0.9
    );
  };

  // Fallback: Upload Selfie File
  const handleSelfieFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const webpFile = await convertToWebP(file, 0.9);
      setLiveSelfieBlob(webpFile);
      setLiveSelfiePreview(URL.createObjectURL(webpFile));
      stopCamera();
    } catch {
      setLiveSelfieBlob(file);
      setLiveSelfiePreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  // Upload Student ID Card File
  const handleCardFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const webpFile = await convertToWebP(file, 0.9);
      setCardFile(webpFile);
      setCardPreview(URL.createObjectURL(webpFile));
    } catch {
      setCardFile(file);
      setCardPreview(URL.createObjectURL(file));
    }
  };

  // Final Submit to Verification API
  const handleSubmitVerification = async () => {
    setErrorMsg(null);

    if (!liveSelfieBlob) {
      setErrorMsg("Please take a live selfie or upload your face photo.");
      return;
    }

    if (!cardFile) {
      setErrorMsg("Please upload your student ID card.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload live selfie
      const selfieData = new FormData();
      selfieData.append("file", liveSelfieBlob, "live_selfie.webp");
      selfieData.append("folder", "campus_stitch/kyc_selfies");

      const selfieRes = await fetch("/api/upload", {
        method: "POST",
        body: selfieData,
      });
      const selfieResult = await selfieRes.json();
      if (!selfieResult.url) {
        throw new Error("Failed to upload live selfie.");
      }

      // 2. Upload student card
      const cardData = new FormData();
      cardData.append("file", cardFile, "student_card.webp");
      cardData.append("folder", "campus_stitch/verifications");

      const cardRes = await fetch("/api/upload", {
        method: "POST",
        body: cardData,
      });
      const cardResult = await cardRes.json();
      if (!cardResult.url) {
        throw new Error("Failed to upload student card.");
      }

      // 3. Post verification request
      const verRes = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authUser?.userId,
          name: name.trim() || authUser?.name,
          studentId: studentId.trim() || authUser?.studentId,
          email: authUser?.email,
          university,
          city,
          program,
          department,
          livePhotoUrl: selfieResult.url,
          cardPhotoUrl: cardResult.url,
        }),
      });

      const verData = await verRes.json();
      if (!verRes.ok || !verData.success) {
        throw new Error(verData.message || "Failed to submit verification request.");
      }

      // Clear the prompt flag and refresh auth
      if (typeof window !== "undefined") {
        localStorage.removeItem("campus_stitch_show_verify_prompt");
      }
      await refreshAuth();
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Verification submit error:", err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileShell hideNav>
      <div className="min-h-screen px-4 py-6 max-w-md mx-auto flex flex-col justify-between">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <Link
              href="/profile"
              onClick={stopCamera}
              className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
              <span>Identity Verification (KYC)</span>
            </div>
            <div className="w-8" />
          </div>

          {/* Success Banner */}
          {submitSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Verification Submitted!
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Your live face selfie and university student ID have been submitted for admin review.
                Once approved, your account badge will turn into{" "}
                <strong className="text-foreground">Verified Student</strong>.
              </p>
              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => router.push("/profile")}
                  className="w-full h-11 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold text-xs shadow-xs"
                >
                  Return to Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full h-10 rounded-xl text-xs font-semibold"
                >
                  Go to Home Feed
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Introduction */}
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Student KYC Verification</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                    Binance-Style Face Scan
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  To protect campus safety, prevent fraud, and build trust in rides and listings,
                  take a quick live selfie and snap your student ID card.
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-2.5 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMsg}</div>
                </div>
              )}

              {/* STEP 1: Live Selfie KYC Frame */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Live Face Selfie
                    </span>
                  </div>
                  {liveSelfiePreview && (
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" /> Captured
                    </span>
                  )}
                </div>

                {/* Webcam or Captured Selfie Preview */}
                <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-dashed border-border">
                  {liveSelfiePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={liveSelfiePreview}
                        alt="Live Face Selfie"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLiveSelfiePreview(null);
                          setLiveSelfieBlob(null);
                          startCamera();
                        }}
                        className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retake
                      </button>
                    </div>
                  ) : isCameraActive ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      {/* Oval Guide Frame Overlay (B&W) */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                        <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse" />
                        <span className="mt-2 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
                          Align face inside oval
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-foreground" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        Live Facial Verification
                      </div>
                      <p className="text-[11px] text-muted-foreground max-w-[200px]">
                        Look directly into your front camera to confirm live liveness
                      </p>
                    </div>
                  )}

                  {/* Hidden Canvas for Frame Capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Camera Actions */}
                {!liveSelfiePreview && (
                  <div className="flex flex-col gap-2">
                    {isCameraActive ? (
                      <Button
                        type="button"
                        onClick={captureSelfie}
                        className="w-full h-10 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4" /> Snap Live Selfie
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={startCamera}
                        className="w-full h-10 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4" /> Open Camera Scan
                      </Button>
                    )}

                    {/* Upload File Alternative */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => selfieUploadInputRef.current?.click()}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Or upload a clear photo of your face
                      </button>
                      <input
                        ref={selfieUploadInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSelfieFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Student Card Upload */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Student ID Card (Front)
                    </span>
                  </div>
                  {cardPreview && (
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" /> Uploaded
                    </span>
                  )}
                </div>

                {cardPreview ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-border bg-muted/20">
                    <img
                      src={cardPreview}
                      alt="Student ID Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCardFile(null);
                        setCardPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                      title="Remove card photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => cardInputRef.current?.click()}
                    className="w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-black dark:hover:border-white bg-muted/20 hover:bg-muted/40 cursor-pointer flex flex-col items-center justify-center transition-all p-4 text-center group"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors mb-2" />
                    <span className="text-xs font-bold text-foreground">
                      Click to upload Student ID card
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Clear photo showing your Name and Photo
                    </span>
                  </div>
                )}
                <input
                  ref={cardInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCardFileUpload}
                  className="hidden"
                />
              </div>

              {/* Student Details Verification (Editable/Confirmable) */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3 text-xs">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span>Student Information</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="text-muted-foreground">Full Name</div>
                    <div className="font-bold text-foreground truncate">{name || "Student"}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="text-muted-foreground">Program</div>
                    <div className="font-bold text-foreground truncate">{program || "BS"}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="text-muted-foreground">University</div>
                    <div className="font-bold text-foreground truncate">{university}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <div className="text-muted-foreground">Campus City</div>
                    <div className="font-bold text-foreground truncate">{city}</div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                onClick={handleSubmitVerification}
                disabled={isSubmitting || !liveSelfieBlob || !cardFile}
                className="w-full h-12 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Verification...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Submit for Admin Approval
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
