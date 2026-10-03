"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Check,
  ShieldCheck,
  Loader2,
  Upload,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataService } from "@/lib/data-service";

export default function VerifyStudentCardPage() {
  const router = useRouter();
  const [name, setName] = React.useState("Muhammad Hammad");
  const [studentId, setStudentId] = React.useState("2021-CS-104");
  const [program, setProgram] = React.useState("BSCS");
  const [department, setDepartment] = React.useState("Computer Science");
  const [cardPhotoUrl, setCardPhotoUrl] = React.useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "campus_stitch/verifications");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload card photo");
      }

      const data = await res.json();
      if (data.url) {
        setCardPhotoUrl(data.url);
      }
    } catch (err) {
      console.error("Student card upload failed:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await DataService.submitVerification({
        name: name.trim(),
        student_id: studentId.trim(),
        program: program.trim(),
        department: department.trim(),
        university: "UET Lahore",
        card_photo_url: cardPhotoUrl || undefined,
      });
      setSubmitted(true);

      setTimeout(() => {
        router.push("/admin");
      }, 1200);
    } catch (err) {
      console.error("Verification submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-white text-zinc-900 select-none">
        {/* Header with 3-step progress bar */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none border-b border-zinc-200">
          <Link
            href="/"
            aria-label="Back"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 flex gap-1.5 px-3">
            <div className="flex-1 h-1 rounded-full bg-black" />
            <div className="flex-1 h-1 rounded-full bg-black" />
            <div className="flex-1 h-1 rounded-full bg-zinc-200" />
          </div>
          <span className="text-xs text-zinc-500 font-semibold shrink-0">
            Step 2 of 3
          </span>
        </header>

        {/* Form Body */}
        <main className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">
              Verify your student status
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Upload your UET Lahore student card to access campus rides and
              student rates.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Card Photo Preview & Upload */}
          <div className="p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 flex items-center gap-3">
            {cardPhotoUrl ? (
              <div className="w-20 h-14 rounded-lg overflow-hidden border border-zinc-300 relative shrink-0">
                <img
                  src={cardPhotoUrl}
                  alt="Student ID card"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-14 shrink-0 rounded-lg bg-white border border-dashed border-zinc-300 flex flex-col items-center justify-center gap-1 text-[10px] text-zinc-500">
                {isUploadingPhoto ? (
                  <Loader2 size={16} className="animate-spin text-black" />
                ) : (
                  <Camera size={16} className="text-zinc-600" />
                )}
                <span>Card photo</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-black flex items-center gap-1">
                {cardPhotoUrl ? "Card uploaded" : "Student ID card"}
                {cardPhotoUrl && <Check size={14} className="text-black" />}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                {cardPhotoUrl
                  ? "Photo attached"
                  : "Upload clear photo of front of card"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-black hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
            >
              {cardPhotoUrl ? "Change" : "Upload"}
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="student-name-input"
                className="text-xs font-bold text-zinc-900 tracking-wide"
              >
                Full Name
              </label>
              <Input
                id="student-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs rounded-lg border-zinc-300 focus:border-black"
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="student-id-input"
                className="text-xs font-bold text-zinc-900 tracking-wide"
              >
                Student Roll Number
              </label>
              <Input
                id="student-id-input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="2021-CS-104"
                className="h-10 text-xs rounded-lg border-zinc-300 focus:border-black font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="student-program-input"
                  className="text-xs font-bold text-zinc-900 tracking-wide"
                >
                  Program
                </label>
                <Input
                  id="student-program-input"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="h-10 text-xs rounded-lg border-zinc-300 focus:border-black"
                  required
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="student-dept-input"
                  className="text-xs font-bold text-zinc-900 tracking-wide"
                >
                  Department
                </label>
                <Input
                  id="student-dept-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-10 text-xs rounded-lg border-zinc-300 focus:border-black"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600">
              <ShieldCheck size={18} className="text-black shrink-0" />
              <span>
                Verified students get a verified badge on commute rides and
                marketplace listings.
              </span>
            </div>
          </div>
        </main>

        {/* Footer Fixed Action */}
        <div className="p-4 border-t border-zinc-200 bg-white flex-none">
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || submitted || !name || !studentId}
            className="w-full h-11 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Submitting verification...
              </>
            ) : submitted ? (
              "Verification Submitted ✓"
            ) : (
              "Submit for Verification"
            )}
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
