import { business } from "../lib/business";

export function Seo() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: business.name,
    description:
      "Sofa repair, reupholstery, furniture restoration, and custom furniture built from scratch in Greater Noida West.",
    telephone: business.phoneTel,
    email: business.email,
    image: "/favicon.svg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop No. 5, Azad Singh Market, Bisrakh, Sector 1",
      addressLocality: "Greater Noida West",
      postalCode: "201306",
      addressCountry: "IN",
    },
    areaServed: "Greater Noida West",
    slogan: business.tagline,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
