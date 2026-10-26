import { business } from "./business";

export function whatsappUrl(service?: string) {
  const base =
    "Hello MS Sofa Repair & Furnishing, I would like to enquire about furniture repair or custom furniture.";
  const text = service ? `${base} I am interested in ${service}.` : base;
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
}
