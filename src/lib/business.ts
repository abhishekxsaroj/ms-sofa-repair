export const business = {
  name: "MS Sofa Repair & Furnishing",
  shortName: "MS Sofa",
  tagline: "Your Comfort, Our Expertise.",
  message: "We Bring New Life to Your Furniture.",
  contactName: "Hasan Rizvi",
  phoneDisplay: "+91 95552 95528",
  phoneTel: "+919555295528",
  whatsapp: "919555295528",
  email: "mssofarepair9@gmail.com",
  addressLines: [
    "Shop No. 5, Azad Singh Market",
    "Bisrakh, Sector 1",
    "Greater Noida West – 201306, India",
  ],
  addressText:
    "Shop No. 5, Azad Singh Market, Bisrakh, Sector 1, Greater Noida West – 201306, India",
  locality: "Greater Noida West",
  values: ["Comfort", "Style", "Quality"] as const,
} as const;

export const services = [
  {
    id: "sofa",
    name: "Sofa Repair & Reupholstery",
    summary: "Repair, reupholstery, and fabric refresh for sofas already in the home.",
    image: "/images/sofa.jpg",
    imageAlt: "Illustrative emerald velvet sofa with timber legs",
  },
  {
    id: "custom",
    name: "Custom Furniture",
    summary: "New sofas, beds, dining sets, and other pieces built from scratch to suit the room.",
    image: "/images/chair.jpg",
    imageAlt: "Illustrative timber chair in a calm interior",
  },
  {
    id: "bed",
    name: "Bed Repair & Custom Furnishing",
    summary: "Repair existing beds, or commission new bedroom furniture made to order.",
    image: "/images/bed.jpg",
    imageAlt: "Illustrative bedroom with upholstered bed framing",
  },
  {
    id: "mattress",
    name: "Mattress Repair & Replacement",
    summary: "Enquiries for mattress repair and replacement options.",
    image: "/images/mattress.jpg",
    imageAlt: "Illustrative made bed with layered linens",
  },
  {
    id: "dining",
    name: "Dining Table & Chair Repair",
    summary: "Restore dining furniture, or build a new table and chairs from scratch.",
    image: "/images/dining.jpg",
    imageAlt: "Illustrative timber dining table with chairs",
  },
  {
    id: "recliner",
    name: "Recliner Chair Service",
    summary: "Repair and service enquiries for recliner chairs.",
    image: "/images/gallery-2.jpg",
    imageAlt: "Illustrative mustard armchair in a living interior",
  },
  {
    id: "curtains",
    name: "Curtains & Home Furnishings",
    summary: "Made-to-measure curtains and furnishings that complement the interior.",
    image: "/images/curtains.jpg",
    imageAlt: "Illustrative draped curtains in a living space",
  },
] as const;

export const commitments = [
  {
    title: "Skilled Professionals",
    copy: "Work is carried out by a team focused on careful furniture repair and made-to-order pieces.",
  },
  {
    title: "Quality Workmanship",
    copy: "Attention stays on fit, finish, and materials — whether restoring a piece or building a new one.",
  },
  {
    title: "On-Time Service",
    copy: "We aim to keep schedules clear and to complete work as discussed.",
  },
  {
    title: "Affordable Pricing",
    copy: "Quotes are prepared around the furniture, the work required, and a fair rate.",
  },
] as const;
