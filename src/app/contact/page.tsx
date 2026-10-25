"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
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
import { useContactMutation } from "@/hooks/use-profile-queries";

const contactSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  university: z.string().optional(),
  subject: z.string().min(1, "Please select an inquiry topic."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);
  const [ticketId, setTicketId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const contactMutation = useContactMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      university: "UET Lahore",
      subject: "General Student Inquiries",
      message: "",
    },
  });

  const submittedEmail = watch("email");

  const onSubmit = (data: ContactFormData) => {
    setErrorMsg(null);

    contactMutation.mutate(
      {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        subject: `[${data.university || "CampuStitch"}] ${data.subject}`,
        message: data.message.trim(),
      },
      {
        onSuccess: (res: any) => {
          setTicketId(res.ticketId || `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
          setSent(true);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to submit support request. Please try again.");
        },
      }
    );
  };

  const isSubmitting = contactMutation.isPending;

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
              <a href="mailto:hammadismail807@gmail.com" className="font-bold text-zinc-950 dark:text-white hover:underline block">
                hammadismail807@gmail.com
              </a>
              <a href="mailto:support@campus-stitch.com" className="text-zinc-500 hover:underline block text-[11px]">
                support@campus-stitch.com
              </a>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-zinc-500 block">Security & Verification</span>
              <a href="mailto:hammadismail807@gmail.com" className="font-bold text-zinc-950 dark:text-white hover:underline block">
                hammadismail807@gmail.com
              </a>
              <a href="mailto:verify@campus-stitch.com" className="text-zinc-500 hover:underline block text-[11px]">
                verify@campus-stitch.com
              </a>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Clock size={14} className="shrink-0" />
                <span>Typical Response: Within 24-48 Hours</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <ShieldCheck size={14} className="shrink-0 text-emerald-600" />
                <span>SSL Encrypted & Protected Transmission</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form with react-hook-form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          {sent ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                Support Ticket Created
              </h2>
              {ticketId && (
                <div className="inline-block px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                  Ticket Ref: {ticketId}
                </div>
              )}
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Thank you for contacting CampuStitch. Our support team has logged your inquiry and will respond to <strong>{submittedEmail}</strong> within 24 to 48 hours.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setTicketId(null);
                    reset();
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                    placeholder="e.g. Hammad Ismail"
                    disabled={isSubmitting}
                    {...register("name")}
                    className={`w-full h-11 px-3.5 border ${
                      errors.name ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                    } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Your Email <span className="text-red-500">*</span>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Your University / Campus
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UET Lahore, NUST, FAST..."
                    disabled={isSubmitting}
                    {...register("university")}
                    className="w-full h-11 px-3.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    disabled={isSubmitting}
                    {...register("subject")}
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
                  rows={5}
                  placeholder="Please provide full details about your request or issue..."
                  disabled={isSubmitting}
                  {...register("message")}
                  className={`w-full p-3.5 border ${
                    errors.message ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                  } bg-white dark:bg-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors resize-none`}
                />
                {errors.message && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.message.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 h-11 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Support Ticket</span>
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
