import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_MOBILE_SCRUB_VH, HERO_SCRUB_VH, TRANSFORM_SCRUB_VH } from "../lib/scroll";
import { useEnquiry } from "../context/EnquiryContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { BeforeAfter } from "./BeforeAfter";
import { Button } from "./Button";

gsap.registerPlugin(ScrollTrigger);

export function Transformation() {
  const { goToEnquiry } = useEnquiry();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const hold = HERO_SCRUB_VH / (HERO_SCRUB_VH + TRANSFORM_SCRUB_VH);
      const play = 1 - hold;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: `+=${HERO_SCRUB_VH + TRANSFORM_SCRUB_VH}%`,
          pin: true,
          scrub: 0.75,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        ".wipe-after",
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", ease: "none", duration: play },
        hold,
      )
        .fromTo(".wipe-line", { left: "0%" }, { left: "100%", ease: "none", duration: play }, hold)
        .to(
          ".title-a",
          { yPercent: -110, opacity: 0, ease: "power2.inOut", duration: play * 0.35 },
          hold + play * 0.08,
        )
        .fromTo(
          ".title-b",
          { yPercent: 80, opacity: 0 },
          { yPercent: 0, opacity: 1, ease: "power2.out", duration: play * 0.4 },
          hold + play * 0.22,
        )
        .fromTo(
          ".transform-copy",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: play * 0.4 },
          hold + play * 0.36,
        );
    });

    mm.add("(max-width: 767px)", () => {
      // Pin only while curtains open — no extra empty scroll after the reveal.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: `+=${HERO_MOBILE_SCRUB_VH}%`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      });
    });

    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={root} className="relative bg-ink text-ivory">
      <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-5 py-24 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <div className="relative hidden overflow-hidden rounded-[2.5rem] md:block">
            <div className="relative aspect-[4/3]">
              <img
                src="/images/transform-before.jpg"
                alt="Illustrative lived-in sofa in a home interior"
                className="h-full w-full object-cover"
              />
              <div
                className="wipe-after absolute inset-0"
                style={{ clipPath: "inset(0 100% 0 0)" }}
              >
                <img
                  src="/images/transform-after.jpg"
                  alt="Illustrative refreshed living room with a cream sectional"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="wipe-line absolute inset-y-0 z-10 w-px bg-ivory/80" />
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] md:hidden">
            <BeforeAfter
              before="/images/transform-before.jpg"
              after="/images/transform-after.jpg"
              beforeAlt="Illustrative lived-in sofa in a home interior"
              afterAlt="Illustrative refreshed living room with a cream sectional"
            />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-ivory/45">
            Illustrative interiors — not a completed customer project
          </p>
        </div>

        <div className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.22em] text-bronze">Repair or made new.</p>
          <div className="relative mt-4 grid overflow-hidden">
            <h2 className="title-a col-start-1 row-start-1 hidden font-display text-4xl leading-[1.12] md:block md:text-5xl">
              Ready for a Refresh?
            </h2>
            <h2 className="title-b col-start-1 row-start-1 font-display text-4xl leading-[1.12] md:text-5xl md:opacity-0">
              Repair it — or make it&nbsp;new.
            </h2>
          </div>
          <div className="transform-copy mt-6 opacity-100 md:opacity-0">
            <p className="leading-relaxed text-ivory/70">
              Worn fabric and tired frames do not have to mean the end of a favourite piece —
              we repair and restore so it can stay. If you need something new, we also build
              custom furniture from scratch.
            </p>
            <div className="mt-8">
              <Button onClick={() => goToEnquiry("Sofa Repair & Reupholstery")}>
                Request a Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
