import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://campus-stitch.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/home",
          "/download",
          "/commute",
          "/market",
          "/hostel",
          "/community",
          "/safety",
          "/contact",
          "/terms",
          "/privacy",
          "/sign-in",
          "/sign-up",
          "/logo.png",
          "/icon.png",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/profile",
          "/dashboard",
          "/delete-account",
          "/verify",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
