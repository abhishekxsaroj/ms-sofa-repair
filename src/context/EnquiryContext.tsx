import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type EnquiryContextValue = {
  service: string;
  setService: (service: string) => void;
  goToEnquiry: (service?: string) => void;
};

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState("");

  const value = useMemo<EnquiryContextValue>(
    () => ({
      service,
      setService,
      goToEnquiry: (next?: string) => {
        if (next) setService(next);
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        window.setTimeout(() => {
          document.getElementById("enquiry-name")?.focus();
        }, 450);
      },
    }),
    [service],
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used within EnquiryProvider");
  return ctx;
}
