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
        "description": "Multi-tenant university student superapp connecting students across Pakistani institutions for carpooling, marketplace, hostel search, and verified campus identity.",
        "areaServed": {
          "@type": "Country",
          "name": "Pakistan"
        },
        "knowsAbout": [
          "Student Commute & Carpooling",
          "University Peer Marketplace",
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
