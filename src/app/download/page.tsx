"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const DIRECT_APK_URL =
  "https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0";

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md bg-white dark:bg-[#121215] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-6 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            CS
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={13} />
              <span>Official Android Release &bull; v1.0.0</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white">
              CampuStitch Android App
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Direct universal APK &bull; 50.2 MB
            </p>
          </div>

          <a
            href={DIRECT_APK_URL}
            className="w-full h-14 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download size={20} />
            <span>Download APK</span>
          </a>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Prefer browser? <span className="font-bold underline">Launch Web App</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
