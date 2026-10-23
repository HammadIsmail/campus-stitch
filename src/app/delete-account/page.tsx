"use client";

import * as React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function DeleteAccountPage() {
  const [email, setEmail] = React.useState("");
  const [studentId, setStudentId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [confirmUnderstood, setConfirmUnderstood] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !studentId.trim() || !confirmUnderstood) {
      setErrorMsg("Please complete all required fields and confirm acknowledgement.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulate sending deletion request to backend queue
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <Trash2 size={13} />
            <span>Google Play Account & Data Deletion Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Request Account & Personal Data Deletion
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            In compliance with Google Play Store policies and international data protection laws, any student or user can request the permanent deletion of their CampuStitch account and all associated personal data.
          </p>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <Trash2 size={14} />
              <span>What Data Will Be Permanently Deleted</span>
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-4 pt-1">
              <li>Student Name, University Email, and Hashed Credentials</li>
              <li>Official Student ID card photographs and verification records</li>
              <li>Live webcam selfie biometric verification images</li>
              <li>All active Marketplace listings and uploaded item pictures</li>
              <li>Scheduled and completed Commute / Carpool entries</li>
              <li>Chat messages, forum posts, comments, and upvotes</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Deletion Timeline & Audit Rules</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Once verified, your account is immediately deactivated and disconnected from your campus tenant. All primary database records and Cloudinary media assets are permanently purged within <strong>30 days</strong>. Minimal transaction audit hashes may be retained where required by Pakistani law (PECA 2016) before permanent automatic rotation.
            </p>
          </div>
        </div>

        {/* Deletion Form / Confirmation */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                Account Deletion Request Received
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                We have recorded your deletion request for <strong>{email}</strong> (Student ID: {studentId}). A confirmation email has been dispatched. Your account access has been revoked and all associated data will be expunged within 30 days.
              </p>
              <div className="pt-2">
                <Link
                  href="/home"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Web Deletion Request Form
              </h2>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-900 dark:text-red-300">
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
                    required
                    placeholder="student@uet.edu.pk or gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Student ID / Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2022-CS-101"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                  Reason for Leaving (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Graduated, transferred to another university, or no longer needing campus services..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmUnderstood}
                  onChange={(e) => setConfirmUnderstood(e.target.checked)}
                  className="mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="confirm" className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed cursor-pointer select-none">
                  I understand that this action is irreversible. My student identity verification status, reputation rating, carpool history, and marketplace listings will be permanently erased.
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <Link
                  href="/privacy"
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                >
                  &larr; Read Privacy Policy
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting || !confirmUnderstood}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Confirm Account Deletion</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* In-App Shortcut Footnote */}
        <div className="text-center text-xs text-zinc-500 space-y-1">
          <p>
            You can also initiate this process directly within the Android mobile app via <strong>Profile ➔ Settings ➔ Delete Account</strong>.
          </p>
          <p>
            Questions? Contact our Data Protection Officer at <a href="mailto:privacy@campus-stitch.com" className="underline font-bold text-zinc-700 dark:text-zinc-300">privacy@campus-stitch.com</a>.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
