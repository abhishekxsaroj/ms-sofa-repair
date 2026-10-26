import { useEffect, useState, type FormEvent } from "react";
import { business } from "../lib/business";
import { track } from "../lib/analytics";
import { PREFERRED_TIMES, SERVICES, normalizeIndianPhone } from "../lib/form";
import { whatsappUrl } from "../lib/whatsapp";
import { useEnquiry } from "../context/EnquiryContext";
import { Button } from "./Button";

type FormState = {
  name: string;
  phone: string;
  service: string;
  message: string;
  locality: string;
  preferredTime: string;
  website: string;
};

const empty: FormState = {
  name: "",
  phone: "",
  service: "",
  message: "",
  locality: "",
  preferredTime: "",
  website: "",
};

export function Enquiry() {
  const { service, setService } = useEnquiry();
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (service) setForm((prev) => ({ ...prev, service }));
  }, [service]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (!started) {
      setStarted(true);
      track("form_start", { form: "enquiry" });
    }
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "service") setService(value);
  }

  function validate() {
    const next: Partial<FormState> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!normalizeIndianPhone(form.phone)) {
      next.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (!form.service) next.service = "Please select a service.";
    if (form.message.trim().length > 2000) {
      next.message = "Please keep the message under 2000 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    setServerError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setServerError(data.error || "Something went wrong. Please try WhatsApp or call us.");
        return;
      }
      setStatus("success");
      track("form_submit", { form: "enquiry", service: form.service });
    } catch {
      setStatus("error");
      setServerError("We could not send your enquiry. Please try WhatsApp or call us directly.");
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-ink py-24 text-ivory md:py-32">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-bronze/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-bronze/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-bronze">Request a quote</p>
          <h2 className="mt-5 font-display text-5xl leading-[0.92] md:text-7xl">
            Repair it, or let us make it new.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ivory/70">
            Tell us what needs repair, or describe the custom piece you want built, and our
            team can follow up to discuss your requirements.
          </p>
          <a
            href={`tel:${business.phoneTel}`}
            className="mt-8 inline-block font-display text-3xl text-bronze md:text-4xl"
          >
            {business.phoneDisplay}
          </a>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-[2.5rem] bg-espresso p-8 md:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-bronze">Talk to us</p>
              <p className="mt-4 font-display text-3xl leading-tight">Hasan Rizvi</p>
              <p className="mt-6 max-w-sm text-ivory/65">
                Prefer a conversation? Call or message us on WhatsApp with a photo of the
                furniture if you have one.
              </p>
            </div>
            <div className="mt-10 space-y-5 text-sm">
              <p>
                <span className="block text-xs uppercase tracking-[0.16em] text-ivory/40">Phone</span>
                <a href={`tel:${business.phoneTel}`} className="mt-1 inline-block text-lg text-ivory">
                  {business.phoneDisplay}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.16em] text-ivory/40">Email</span>
                <a href={`mailto:${business.email}`} className="mt-1 inline-block">
                  {business.email}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.16em] text-ivory/40">Studio</span>
                <span className="mt-1 block max-w-xs text-ivory/80">{business.addressText}</span>
              </p>
              <Button href={whatsappUrl(service)} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </Button>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-ivory p-7 text-ink shadow-[0_30px_80px_rgba(196,165,116,0.18)] md:p-10">
            {status === "success" ? (
              <div>
                <h3 className="font-display text-4xl">Enquiry received.</h3>
                <p className="mt-4 text-ink/70">
                  Thank you, {form.name}. We have your details and will follow up. You can
                  also continue the conversation on WhatsApp.
                </p>
                <div className="mt-8">
                  <Button href={whatsappUrl(form.service)} target="_blank" rel="noreferrer">
                    Chat on WhatsApp
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <p className="font-display text-3xl">Send an enquiry</p>
                <div className="field">
                  <label htmlFor="enquiry-name">Full name</label>
                  <input
                    id="enquiry-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  {errors.name ? <p className="error">{errors.name}</p> : null}
                </div>
                <div className="field">
                  <label htmlFor="enquiry-phone">Phone number</label>
                  <input
                    id="enquiry-phone"
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                  {errors.phone ? <p className="error">{errors.phone}</p> : null}
                </div>
                <div className="field">
                  <label htmlFor="enquiry-service">Service required</label>
                  <select
                    id="enquiry-service"
                    name="service"
                    value={form.service}
                    onChange={(e) => update("service", e.target.value)}
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.service ? <p className="error">{errors.service}</p> : null}
                </div>
                <div className="field">
                  <label htmlFor="enquiry-message">What you need repaired, or made from scratch (optional)</label>
                  <textarea
                    id="enquiry-message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                  />
                  {errors.message ? <p className="error">{errors.message}</p> : null}
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="field">
                    <label htmlFor="enquiry-locality">Area or locality (optional)</label>
                    <input
                      id="enquiry-locality"
                      name="locality"
                      value={form.locality}
                      onChange={(e) => update("locality", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="enquiry-time">Preferred contact time (optional)</label>
                    <select
                      id="enquiry-time"
                      name="preferredTime"
                      value={form.preferredTime}
                      onChange={(e) => update("preferredTime", e.target.value)}
                    >
                      <option value="">Select</option>
                      {PREFERRED_TIMES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="hp" aria-hidden="true">
                  <label htmlFor="enquiry-website">Website</label>
                  <input
                    id="enquiry-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </div>
                <p className="text-xs leading-relaxed text-ink/55">
                  By sending this form you agree to be contacted by {business.name} about this
                  enquiry by phone, WhatsApp, or email.
                </p>
                {status === "error" ? <p className="error">{serverError}</p> : null}
                <Button type="submit" disabled={status === "submitting"}>
                  {status === "submitting" ? "Sending…" : "Send Enquiry"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
