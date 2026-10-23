"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Car,
  ShoppingBag,
  Building,
  MessageSquare,
  Lock,
  ChevronRight,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function TermsPage() {
  const [activeSection, setActiveSection] = React.useState("acceptance");

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", icon: Scale },
    { id: "eligibility", title: "2. Eligibility & Student KYC", icon: ShieldCheck },
    { id: "marketplace", title: "3. Student Marketplace Rules", icon: ShoppingBag },
    { id: "commute", title: "4. Campus Commute & Rideshare", icon: Car },
    { id: "hostels", title: "5. Hostel & Roommate Discovery", icon: Building },
    { id: "community", title: "6. Community Feed & Code of Conduct", icon: MessageSquare },
    { id: "disclaimers", title: "7. Disclaimers & Limitation of Liability", icon: AlertTriangle },
    { id: "termination", title: "8. Account Termination & Suspension", icon: Lock },
    { id: "jurisdiction", title: "9. Governing Law & Dispute Resolution", icon: Scale },
    { id: "contact", title: "10. Contact & Grievance Redressal", icon: Mail },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNav />

      {/* Hero Header */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
            <FileText size={13} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Terms and Conditions of Service
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Please read these terms carefully before accessing or using CampuStitch. By registering or using our mobile application or web portal, you agree to be bound by these university platform policies.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span>Applicable to all Pakistani Campus Tenants</span>
          </div>
        </div>
      </section>

      {/* Content Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents Sticky Sidebar */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 space-y-1 p-3 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 block">
              Contents
            </span>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  activeSection === sec.id
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

        {/* Main Terms Document Body */}
        <main className="lg:col-span-3 space-y-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {/* Section 1 */}
          <section id="acceptance" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Scale size={18} className="text-zinc-900 dark:text-white" />
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Student&quot;, &quot;User&quot;, &quot;You&quot;) and <strong>CampuStitch</strong> (&quot;CampuStitch&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;), governing your access to and use of the CampuStitch mobile application (on Google Play Store and other distributions) and the CampuStitch web portal at <code>campus-stitch.com</code>.
            </p>
            <p>
              By creating an account, browsing campus listings, participating in student carpools, or posting on community forums, you agree to strictly comply with these Terms, our <Link href="/privacy" className="text-black dark:text-white font-bold underline">Privacy Policy</Link>, and your university&apos;s institutional code of conduct.
            </p>
          </section>

          {/* Section 2 */}
          <section id="eligibility" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              2. Eligibility & Student KYC Verification
            </h2>
            <p>
              CampuStitch operates strictly as a closed, verified university network. To maintain student safety and eliminate scams:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Affiliation Requirement:</strong> You must be an actively enrolled student, faculty member, or staff member of an accredited Pakistani higher education institution (e.g., UET Lahore, NUST, FAST NUCES, LUMS, PU, etc.).
              </li>
              <li>
                <strong>KYC Verification:</strong> Users are required to undergo student identity verification (uploading an authentic physical student identification card and a live camera snapshot selfie).
              </li>
              <li>
                <strong>Zero Impersonation Tolerance:</strong> Falsifying identity documents, using borrowed or altered student cards, or creating fraudulent accounts will result in immediate permanent banning and formal referral to your university disciplinary committee.
              </li>
              <li>
                <strong>Campus Scoping:</strong> Your account is mapped directly to your specific university campus tenant. You may only interact with feeds, rides, and marketplace items authorized for your campus.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="marketplace" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-zinc-900 dark:text-white" />
              3. Student Marketplace Rules & Peer Transactions
            </h2>
            <p>
              The CampuStitch Marketplace facilitates peer-to-peer sale and exchange of academic books, engineering calculators, drawing boards, lab coats, and student gear:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Introductory Venue Only:</strong> CampuStitch provides a discovery platform for verified students. We do not act as an escrow agent, retailer, or reseller. All financial transactions occur directly between the buyer and seller.
              </li>
              <li>
                <strong>Academic Integrity & Prohibited Items:</strong> It is strictly prohibited to list exam papers, leaked answer keys, unauthorized assignment solutions, weapons, narcotics, counterfeit medications, or any items violating Pakistani law or campus regulations.
              </li>
              <li>
                <strong>Safe Meeting Zones:</strong> For your physical safety, all in-person handovers and inspections must take place in high-visibility, daylight campus public areas such as university central libraries, department foyers, or cafeteria courtyards.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="commute" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Car size={18} className="text-zinc-900 dark:text-white" />
              4. Campus Commute & Non-Commercial Carpooling
            </h2>
            <p>
              Our commute sharing feature allows verified students and faculty to share daily rides to and from campus to reduce fuel expenses and carbon footprint:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Non-Commercial Nature:</strong> Rides offered through CampuStitch are purely non-commercial carpooling and fuel cost-sharing between peers. CampuStitch is not a commercial taxi, for-hire transportation provider, or common carrier.
              </li>
              <li>
                <strong>Driver Qualifications:</strong> Any student offering a carpool must possess a valid Pakistani driving license, valid vehicle registration, and ensure their vehicle is roadworthy and complies with traffic laws.
              </li>
              <li>
                <strong>Passenger & Driver Conduct:</strong> All ride participants must exhibit utmost respect, punctuality, and adhere to agreed pick-up spots. Smoking or misconduct during rides is grounds for immediate reporting.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="hostels" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Building size={18} className="text-zinc-900 dark:text-white" />
              5. Hostel & Roommate Discovery
            </h2>
            <p>
              Students searching for private or shared accommodation near campus may use CampuStitch to find vacancies or fellow batchmate flatmates. Listings must accurately describe amenities, rent, and utility terms. Independent rental agreements, tenancy contracts, and deposits are solely between the student and property owner.
            </p>
          </section>

          {/* Section 6 */}
          <section id="community" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-zinc-900 dark:text-white" />
              6. Community Feed & Code of Conduct
            </h2>
            <p>
              CampuStitch hosts Reddit-style university discussion feeds. We maintain a strict zero-tolerance policy against:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Harassment, stalking, threats, cyber-bullying, or defamation of students or university professors.</li>
              <li>Sectarian, hate-speech, discriminatory, or sexually explicit content.</li>
              <li>Spam, phishing links, multi-level marketing, or unapproved commercial advertising.</li>
            </ul>
            <p>
              Designated Campus Admins monitor posts and have full authority to remove violations, issue warnings, or revoke access.
            </p>
          </section>

          {/* Section 7 */}
          <section id="disclaimers" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              7. Disclaimers & Limitation of Liability
            </h2>
            <p>
              THE CAMPUSTITCH PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMISSIBLE UNDER PAKISTANI LAW, CAMPUSTITCH AND ITS OPERATORS DISCLAIM ALL LIABILITY FOR:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>Private transactions, condition or safety of goods purchased from student sellers.</li>
              <li>Traffic accidents, delays, or disputes arising during peer carpooling.</li>
              <li>Unauthorized access resulting from a student failing to secure their login credentials.</li>
              <li>Temporary technical interruptions, network downtime, or data synchronization delays.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="termination" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Lock size={18} className="text-zinc-900 dark:text-white" />
              8. Account Termination & Suspension
            </h2>
            <p>
              You may terminate your account at any time via the in-app profile settings or our dedicated <Link href="/delete-account" className="font-bold underline text-black dark:text-white">Account Deletion Portal</Link>. CampuStitch reserves the right to suspend or permanently ban any account that violates these Terms, abuses the platform, or ceases to be an affiliated member of their campus.
            </p>
          </section>

          {/* Section 9 */}
          <section id="jurisdiction" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Scale size={18} className="text-zinc-900 dark:text-white" />
              9. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by, construed, and enforced in accordance with the laws of the <strong>Islamic Republic of Pakistan</strong>, including the Prevention of Electronic Crimes Act (PECA 2016). Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Lahore or Islamabad, Pakistan.
            </p>
          </section>

          {/* Section 10 */}
          <section id="contact" className="scroll-mt-24 space-y-3 bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Mail size={18} className="text-zinc-900 dark:text-white" />
              10. Contact & Grievance Redressal
            </h2>
            <p>
              For legal inquiries, violations of these terms, or student safety concerns, please reach out to our platform support team:
            </p>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <div><strong>Platform Administration:</strong> CampuStitch Legal & Compliance Team</div>
              <div><strong>Email:</strong> legal@campus-stitch.com / ranahammadismail@gmail.com</div>
              <div><strong>Support Desk:</strong> <Link href="/contact" className="underline font-bold">campus-stitch.com/contact</Link></div>
              <div><strong>Registered Operations:</strong> Lahore, Punjab, Pakistan</div>
            </div>
          </section>
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}
