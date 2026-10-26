import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function TypographySection() {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".typo-line", {
        yPercent: 110,
        stagger: 0.12,
        duration: 1.1,
        ease: "power4.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-ink px-5 py-28 text-ivory md:px-8 md:py-40"
    >
      <div className="pointer-events-none absolute right-[8%] top-16 h-28 w-28 rounded-full bg-bronze/70 md:h-36 md:w-36" />
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.24em] text-bronze">The idea</p>
        <h2 className="mt-8 font-display text-5xl leading-[0.92] md:text-7xl lg:text-[6.4rem]">
          <span className="clip-title block">
            <span className="typo-line block">Comfort isn&apos;t something</span>
          </span>
          <span className="clip-title block">
            <span className="typo-line block">you throw away.</span>
          </span>
          <span className="clip-title mt-4 block italic text-ivory/80">
            <span className="typo-line block">It&apos;s something you restore.</span>
          </span>
          <span className="clip-title mt-4 block italic text-ivory/70">
            <span className="typo-line block">Or something we make new.</span>
          </span>
        </h2>
        <p className="mt-12 max-w-lg text-lg leading-relaxed text-ivory/65">
          Repair keeps a well-loved sofa, bed, or chair in the rooms that already feel like
          home. When a new piece is needed, we build it from scratch — with the same attention
          to fabric, structure, and finish.
        </p>
      </div>
    </section>
  );
}
