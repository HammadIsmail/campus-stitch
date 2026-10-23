import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const baseUrl = "https://campus-stitch.vercel.app";

  // Build schema.org BreadcrumbList
  const schemaItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-xs text-zinc-500 dark:text-zinc-400 py-3 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5">
          <li className="flex items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
            >
              <Home size={13} className="shrink-0" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.label} className="flex items-center gap-1.5">
                <ChevronRight size={12} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-black dark:hover:text-white transition-colors font-medium truncate max-w-[140px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[160px] sm:max-w-none"
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
