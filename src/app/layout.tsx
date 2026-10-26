import type { Metadata } from "next";
import "./globals.css";
import { OrganizationSchema } from "@/components/organization-schema";

export const metadata: Metadata = {
  metadataBase: new URL("https://campus-stitch.vercel.app"),
  title: {
    default: "CampuStitch - Campus life is easier when we help each other",
    template: "%s | CampuStitch",
  },
  description:
    "Find rides, sell things you no longer need, rent out your bike, and discover services offered by students at your university.",
  keywords: [
    "campus rides",
    "student carpool",
    "university commute",
    "student marketplace",
    "bike rentals",
    "student services",
    "peer tutoring",
    "verified students",
    "Pakistani universities",
    "CampuStitch",
  ],
  authors: [{ name: "CampuStitch Team", url: "https://campus-stitch.vercel.app" }],
  creator: "CampuStitch",
  applicationName: "CampuStitch",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "CampuStitch - Campus life is easier when we help each other",
    description:
      "Find rides, sell things you no longer need, rent out your bike, and discover services offered by students at your university.",
    url: "https://campus-stitch.vercel.app",
    siteName: "CampuStitch",
    images: [
      {
        url: "/logo.png",
        width: 571,
        height: 571,
        alt: "CampuStitch Logo",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampuStitch - Campus life is easier when we help each other",
    description:
      "Find rides, sell things you no longer need, rent out your bike, and discover services offered by students at your university.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

import { AuthProvider } from "@/lib/auth-context";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { ThemeProvider } from "@/lib/theme-context";
import { QueryProvider } from "@/components/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('campus_stitch_theme');
                  var isDark = theme === 'dark' || (!theme || theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#ECEEF2] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <QueryProvider>
          <ThemeProvider>
            <AuthSessionProvider>
              <AuthProvider>{children}</AuthProvider>
            </AuthSessionProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
