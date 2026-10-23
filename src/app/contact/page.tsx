"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Building2,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [university, setUniversity] = React.useState("UET Lahore");
  const [subject, setSubject] = React.useState("General Student Inquiries");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [ticketId, setTicketId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          university: university.trim(),
          subject,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to submit support request. Please try again.");
      } else {
        setTicketId(data.ticketId || null);
        setSent(true);
      }
    } catch {
      setErrorMsg("Network error. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNav />

      {/* Header */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <Breadcrumbs items={[{ label: "Contact Support" }]} className="py-0 mb-1" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
            <Mail size={13} />
            <span>Developer & Platform Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Contact CampuStitch Support
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Have questions regarding student verification, ride coordination, campus partnership, or technical issues? Our support desk is here to help.
          </p>
        </div>
      </section>

      {/* Content Form and Info */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-2xs text-xs">
            <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
              Official Contact Points
            </h3>

            <div className="space-y-1">
              <span className="font-semibold text-zinc-500 block">General Support</span>
              <a href="mailto:support@campus-stitch.com" className="font-bold text-zinc-950 dark:text-white hover:underline">
                support@campus-stitch.com
              </a>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-zinc-500 block">Lead Platform Administrator</span>
              <a href="mailto:ranahammadismail@gmail.com" className="font-bold text-zinc-950 dark:text-white hover:underline">
                ranahammadismail@gmail.com
              </a>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-zinc-500 block">Legal & Privacy DPO</span>
              <a href="mailto:privacy@campus-stitch.com" className="font-bold text-zinc-950 dark:text-white hover:underline">
                privacy@campus-stitch.com
              </a>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1 text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>Response Time: Within 24-48 hours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 size={13} />
                <span>Headquarters: Lahore, Pakistan</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck size={15} />
              <span>Campus Admin Inquiries</span>
            </div>
            <p className="leading-relaxed">
              Are you an official university student council representative or campus administrator wishing to onboard your university? Select &quot;Campus Partnership&quot; in the form.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          {sent ? (
            <div className="py-12 text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                Message Sent Successfully
              </h2>
              {ticketId && (
                <div className="inline-block px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                  Ticket Ref: {ticketId}
                </div>
              )}
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Thank you for contacting CampuStitch. Our support team has logged your inquiry and will respond to <strong>{email}</strong> within 24 to 48 hours.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setMessage("");
                    setTicketId(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Send a Message
              </h2>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hammad Ismail"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Your Email <span className="text-red-500">*</span>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Your University / Campus
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UET Lahore, NUST, FAST..."
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors cursor-pointer"
                  >
                    <option value="General Student Inquiries">General Student Inquiries</option>
                    <option value="Student Identity Verification Issue">Student Identity Verification Issue</option>
                    <option value="Carpool / Commute Dispute">Carpool / Commute Dispute</option>
                    <option value="Marketplace Fraud / Safety Report">Marketplace Fraud / Safety Report</option>
                    <option value="University Onboarding / Partnership">University Onboarding / Partnership</option>
                    <option value="Bug Report / Technical Issue">Bug Report / Technical Issue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                  Message Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Inquiry</span>
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
