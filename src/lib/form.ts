export const SERVICES = [
  "Sofa Repair & Reupholstery",
  "Custom Furniture",
  "Bed Repair & Custom Furnishing",
  "Mattress Repair & Replacement",
  "Dining Table & Chair Repair",
  "Recliner Chair Service",
  "Curtains & Home Furnishings",
  "Other",
] as const;

export const PREFERRED_TIMES = ["Anytime", "Morning", "Afternoon", "Evening"] as const;

export function normalizeIndianPhone(raw: string) {
  const compact = raw.replace(/[^\d+]/g, "");
  const digits = compact.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\+91[6-9]\d{9}$/.test(compact)) return compact;
  return null;
}
