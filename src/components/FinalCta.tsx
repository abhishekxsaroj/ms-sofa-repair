import { business } from "../lib/business";
import { whatsappUrl } from "../lib/whatsapp";
import { useEnquiry } from "../context/EnquiryContext";
import { Button } from "./Button";

export function FinalCta() {
  const { goToEnquiry, service } = useEnquiry();

  return (
    <section className="relative overflow-hidden bg-ink py-28 text-ivory md:py-36">
      <img
        src="/images/hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-ink/75" />
      <div className="relative mx-auto max-w-5xl px-5 text-center md:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-bronze">{business.message}</p>
        <h2 className="mt-6 font-display text-5xl leading-[0.9] md:text-7xl lg:text-8xl">
          Your Comfort.
          <span className="mt-2 block italic">Our Expertise.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-ivory/75">
          Repair the pieces you love, or ask us to build something new.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={() => goToEnquiry()}>
            Request a Quote
          </Button>
          <Button
            variant="ghost"
            href={whatsappUrl(service)}
            target="_blank"
            rel="noreferrer"
            className="text-ivory"
          >
            Chat on WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
