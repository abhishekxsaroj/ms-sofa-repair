declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params?: Record<string, string>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

export function loadAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id || document.getElementById("ga-src")) return;

  const script = document.createElement("script");
  script.id = "ga-src";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
}
