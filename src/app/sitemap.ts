import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://campus-stitch.vercel.app";
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/commute`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/market`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hostel`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
