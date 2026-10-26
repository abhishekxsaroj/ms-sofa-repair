import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "../lib/whatsapp";
import { useEnquiry } from "../context/EnquiryContext";

export function WhatsAppButton() {
  const { service } = useEnquiry();

  return (
    <a
      href={whatsappUrl(service)}
      target="_blank"
      rel="noreferrer"
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm text-white shadow-lg md:right-6 md:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
