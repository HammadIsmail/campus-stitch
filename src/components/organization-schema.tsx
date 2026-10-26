export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://campus-stitch.vercel.app/#organization",
        "name": "CampuStitch",
        "url": "https://campus-stitch.vercel.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://campus-stitch.vercel.app/logo.png",
          "caption": "CampuStitch Pakistan Logo"
        },
        "description": "Connecting university students across Pakistan to share rides, buy and sell items, rent bikes, and offer campus services within a verified community.",
        "areaServed": {
          "@type": "Country",
          "name": "Pakistan"
        },
        "knowsAbout": [
          "Campus Carpool & Rides",
          "Student Marketplace",
          "Bike & Cycle Rentals",
          "Student Campus Services",
          "Student Identity Verification"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://campus-stitch.vercel.app/#website",
        "url": "https://campus-stitch.vercel.app",
        "name": "CampuStitch",
        "publisher": {
          "@id": "https://campus-stitch.vercel.app/#organization"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
