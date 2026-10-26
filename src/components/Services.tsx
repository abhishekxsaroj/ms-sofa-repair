import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "../lib/business";
import { useEnquiry } from "../context/EnquiryContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Button } from "./Button";

gsap.registerPlugin(ScrollTrigger);

export function Services() {
  const { goToEnquiry } = useEnquiry();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".service-item");
      items.forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        });
      });

      if (!reduced) {
        gsap.from(".service-heading", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".service-heading", start: "top 80%" },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="services" ref={root} className="bg-espresso py-24 text-ivory md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="text-xs uppercase tracking-[0.22em] text-bronze">Services</p>
            <h2 className="service-heading mt-4 font-display text-4xl leading-[0.95] md:text-6xl lg:text-7xl">
              Repair. Restore. Make it new.
            </h2>
          </div>
          <p className="text-ivory/60 md:col-span-4 md:text-right">
            Repair for the furniture you already love, and custom pieces built from scratch.
          </p>
        </div>

        <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-16">
          <div className="sticky top-28 hidden h-[70vh] lg:col-span-5 lg:block">
            <div className="relative h-full overflow-hidden rounded-[2.75rem]">
              {services.map((service, index) => (
                <img
                  key={service.id}
                  src={service.image}
                  alt={service.imageAlt}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                    active === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ivory/40">
              Illustrative imagery
            </p>
          </div>

          <div className="lg:col-span-7">
            {services.map((service, index) => (
              <article
                key={service.id}
                className={`service-item py-10 ${
                  active === index ? "lg:opacity-100" : "lg:opacity-50"
                }`}
              >
                <div
                  className={`mb-6 overflow-hidden lg:hidden ${
                    index % 3 === 0 ? "aspect-[4/5] rounded-[2.5rem]" : "aspect-[4/3] rounded-[2rem]"
                  } ${index % 2 === 1 ? "ml-8" : "mr-8"}`}
                >
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-xs tracking-[0.22em] text-bronze">0{index + 1}</p>
                <h3 className="mt-3 font-display text-3xl lg:text-4xl">{service.name}</h3>
                <p className="mt-4 max-w-md text-ivory/65">{service.summary}</p>
                <div className="mt-6">
                  <Button onClick={() => goToEnquiry(service.name)}>
                    Enquire About This Service
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
