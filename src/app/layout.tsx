import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampuStitch - Smart Student Marketplace & Commute",
  description:
    "Student-verified commute sharing, marketplace, hostel services, and AI campus assistant for UET Lahore.",
};

import { AuthProvider } from "@/lib/auth-context";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { ThemeProvider } from "@/lib/theme-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
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
        <ThemeProvider>
          <AuthSessionProvider>
            <AuthProvider>{children}</AuthProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
