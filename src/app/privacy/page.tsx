"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Eye,
  Camera,
  Server,
  Lock,
  Trash2,
  Share2,
  UserCheck,
  Smartphone,
  Mail,
  CheckCircle,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = React.useState("overview");

  const sections = [
    { id: "overview", title: "1. Overview & Data Controller", icon: Shield },
    { id: "data-collected", title: "2. Information We Collect", icon: Eye },
    { id: "camera-permissions", title: "3. Device Permissions & Camera Use", icon: Camera },
    { id: "purpose-use", title: "4. How We Use Your Data", icon: UserCheck },
    { id: "tenant-isolation", title: "5. Campus Scoping & Security", icon: Lock },
    { id: "third-parties", title: "6. Third-Party Processors", icon: Server },
    { id: "data-retention", title: "7. Data Retention & Deletion Rights", icon: Trash2 },
    { id: "children", title: "8. Children's Privacy", icon: Shield },
    { id: "contact", title: "9. Contact & DPO", icon: Mail },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNav />

      {/* Hero Header */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} className="py-0 mb-1" />

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Privacy Policy & Data Safety
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Your privacy and student data security are paramount. This policy discloses how CampuStitch collects, verifies, protects, and handles personal data across our Android mobile app and web platform.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span>GDPR, PECA (Pakistan), & Google Play Compliant</span>
          </div>
        </div>
      </section>

      {/* Content Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents Sticky Sidebar */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 space-y-1 p-3 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 block">
              Sections
            </span>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${activeSection === sec.id
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
              >
                <sec.icon size={13} className="shrink-0" />
                <span className="truncate">{sec.title}</span>
              </a>
            ))}
          </div>
        </aside>

        {/* Main Privacy Document Body */}
        <main className="lg:col-span-3 space-y-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {/* Section 1 */}
          <section id="overview" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-emerald-600 dark:text-emerald-400" />
              1. Overview & Data Controller
            </h2>
            <p>
              CampuStitch (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the data controller for the CampuStitch mobile application and web portal. Our platform provides verified student utilities (carpooling, marketplace, hostel listings, and community discussion) for universities in Pakistan.
            </p>
            <p>
              We operate under a strict <strong>Privacy-by-Design</strong> ethos: student information is strictly scoped to your verified university campus, protected with encryption, and never shared or sold to advertising brokerages.
            </p>
          </section>

          {/* Section 2 */}
          <section id="data-collected" className="scroll-mt-24 space-y-4 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Eye size={18} className="text-zinc-900 dark:text-white" />
              2. Information We Collect
            </h2>
            <p>
              To provide authentic campus services and fulfill Google Play Developer requirements, we collect the following categories of data:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white mb-1">
                  A. Student Profile & Affiliation
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Full name, email address, password hash (bcrypt), degree program, student roll number, University ID, and Campus ID.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white mb-1">
                  B. Student KYC Verification Documents (High-Security)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  A photograph of your official physical student card and a live camera snapshot (selfie). These images are used exclusively to confirm you are an authentic student of the claimed campus and are reviewed only by authorized Campus Administrators.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white mb-1">
                  C. User Content & Activity
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Marketplace listing photos and descriptions, carpool routes and pickup locations, hostel listings, community forum discussions, upvotes, and direct chat messages between students.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white mb-1">
                  D. Device & Security Telemetry
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Device model, operating system version, app version, IP address, and session tokens to secure accounts against credential stuffing and unauthorized account access.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="camera-permissions" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Camera size={18} className="text-zinc-900 dark:text-white" />
              3. Device Permissions & Camera Use (Google Play Disclosure)
            </h2>
            <p>
              In accordance with Google Play Developer Policies, we explicitly disclose why specific Android permissions are requested:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Camera Permission (<code>android.permission.CAMERA</code>):</strong> Required to capture a live webcam/phone camera selfie during the Student KYC verification process, and to photograph items for student marketplace listings. The camera is never accessed in the background or without user initiation.
              </li>
              <li>
                <strong>Storage / Media Images (<code>android.permission.READ_MEDIA_IMAGES</code>):</strong> Required solely to allow you to upload images of your student card or marketplace items from your photo gallery.
              </li>
              <li>
                <strong>Location Permission (Optional):</strong> If enabled, used solely to compute distance and convenient meeting or pickup spots for campus carpools.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="purpose-use" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <UserCheck size={18} className="text-zinc-900 dark:text-white" />
              4. How We Use Your Data
            </h2>
            <p>We process your information strictly for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>Authenticating your student account and issuing cryptographic JWT session tokens.</li>
              <li>Verifying your campus enrollment status through our dual-factor ID card and facial verification check.</li>
              <li>Displaying campus-isolated carpools, second-hand books, and hostel matches.</li>
              <li>Enabling student-to-student messaging for coordinating rides and book purchases.</li>
              <li>Moderating forum content to prevent harassment, fraud, and academic dishonesty.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="tenant-isolation" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Lock size={18} className="text-emerald-600 dark:text-emerald-400" />
              5. Campus Scoping & Data Security
            </h2>
            <p>
              CampuStitch implements strict <strong>Campus Data Isolation</strong>. Every record is indexed with a mandatory campus scope:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Students from UET Lahore cannot view, query, or interact with private student records, ride schedules, or KYC queues of NUST or FAST students.
              </li>
              <li>
                Campus Administrators are legally restricted to moderating solely their designated university campus.
              </li>
              <li>
                All network transmissions utilize TLS 1.3 encryption. Passwords are salted and hashed using bcrypt.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="third-parties" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Server size={18} className="text-zinc-900 dark:text-white" />
              6. Third-Party Infrastructure & No Sale of Data
            </h2>
            <p>
              <strong>We do NOT sell, rent, or trade your personal information</strong> with data brokers or advertising networks.
            </p>
            <p>
              We utilize select, industry-standard infrastructure sub-processors strictly to deliver app functionality:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li><strong>Cloud Database Infrastructure:</strong> Secure encrypted relational data storage with role-based access control.</li>
              <li><strong>Cloudinary:</strong> Secure CDN for student ID cards and listing photo uploads.</li>
              <li><strong>Nodemailer:</strong> One-Time Password (OTP) verification email dispatch.</li>
            </ul>
          </section>

          {/* Section 7 - MANDATORY GOOGLE PLAY DATA DELETION REQUIREMENT */}
          <section id="data-retention" className="scroll-mt-24 space-y-4 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" />
              7. Account & Data Deletion Policy (Google Play Mandate)
            </h2>
            <p>
              In accordance with Google Play&apos;s Account Deletion Policy, users have the absolute right to delete their account and all associated personal data permanently without hindrance:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-950 dark:text-white">
                  <Smartphone size={16} />
                  <span>Option 1: In-App Deletion</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Open the CampuStitch mobile app ➔ Navigate to <strong>Profile</strong> ➔ Tap <strong>Account Settings</strong> ➔ Select <strong>Delete Account & Data</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-950 dark:text-white">
                  <Share2 size={16} />
                  <span>Option 2: Web Deletion URL</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Submit a deletion request via our dedicated public portal without needing to reinstall the app:
                </p>
                <Link
                  href="/delete-account"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 underline"
                >
                  Go to campus-stitch.com/delete-account
                </Link>
              </div>
            </div>

            <div className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 rounded-xl text-xs text-zinc-700 dark:text-zinc-300">
              <strong>Data Purged Upon Deletion:</strong> Full account profile, email, hashed credentials, student card photos, KYC live selfie biometric images, active marketplace listings, carpool schedules, and chat history are permanently scrubbed from our production databases within 30 days.
            </div>
          </section>

          {/* Section 8 */}
          <section id="children" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-zinc-900 dark:text-white" />
              8. Children&apos;s Privacy
            </h2>
            <p>
              CampuStitch is designed exclusively for university and college students aged 17 and older. We do not knowingly collect personal data from children under 13. If you believe a minor has registered without authorization, please contact us for immediate account purging.
            </p>
          </section>

          {/* Section 9 */}
          <section id="contact" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Mail size={18} className="text-zinc-900 dark:text-white" />
              9. Contact & Data Protection Officer (DPO)
            </h2>
            <p>
              For privacy inquiries, GDPR/PECA data access requests, or regulatory questions:
            </p>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <div><strong>Data Protection Officer:</strong> CampuStitch Information Security Office</div>
              <div><strong>Email:</strong> privacy@campus-stitch.com / ranahammadismail@gmail.com</div>
              <div><strong>Support Desk:</strong> <Link href="/contact" className="underline font-bold">campus-stitch.com/contact</Link></div>
              <div><strong>Location:</strong> Lahore, Pakistan</div>
            </div>
          </section>
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}
