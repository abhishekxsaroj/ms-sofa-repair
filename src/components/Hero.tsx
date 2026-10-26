import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { business } from "../lib/business";
import { HERO_SCRUB_VH } from "../lib/scroll";
import { useEnquiry } from "../context/EnquiryContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Button } from "./Button";

const HeroScene = lazy(() =>
  import("./HeroScene").then((module) => ({ default: module.HeroScene })),
);

gsap.registerPlugin(ScrollTrigger);

function canUseWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Hero() {
  const { goToEnquiry } = useEnquiry();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [webgl] = useState(() => canUseWebGL());
  const [ready, setReady] = useState(false);
  const use3d = webgl && !reduced;
  const cinematic = !reduced;

  useLayoutEffect(() => {
    if (!root.current) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.from(".hero-line", {
          yPercent: 110,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.12,
          delay: 0.4,
        });
        gsap.from(".hero-kicker", { opacity: 0, y: 10, duration: 0.8, delay: 0.28, ease: "power2.out" });
        gsap.from(".hero-copy", { opacity: 0, y: 14, duration: 0.9, delay: 0.9, ease: "power2.out" });
      }

      if (!cinematic) return;

      const buildTimeline = (scrub: number, endVh: number) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            start: 0,
            end: () => window.innerHeight * (endVh / 100),
            scrub,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progress.current = self.progress;
            },
          },
        });

        tl.to(
          ".hero-content",
          { opacity: 0, y: 24, pointerEvents: "none", ease: "none", duration: 0.26 },
          0,
        )
          .to(".hero-veil", { opacity: 0, ease: "none", duration: 0.3 }, 0.05)
          .to(".hero-stage", { autoAlpha: 0, ease: "none", duration: 0.12 }, 0.88);

        if (!use3d) {
          tl.to(".curtain-left", { xPercent: -102, ease: "none", duration: 0.5 }, 0.34)
            .to(".curtain-right", { xPercent: 102, ease: "none", duration: 0.5 }, 0.34)
            .to(".hero-css-curtain", { opacity: 0, ease: "none", duration: 0.16 }, 0.72);
        }
      };

      mm.add("(max-width: 767px)", () => {
        buildTimeline(0.45, HERO_SCRUB_VH);
      });

      mm.add("(min-width: 768px)", () => {
        buildTimeline(0.7, HERO_SCRUB_VH);
      });
    }, root);

    return () => {
      progress.current = 0;
      mm.revert();
      ctx.revert();
    };
  }, [reduced, cinematic, use3d]);

  const copy = (
    <div className="hero-content pointer-events-none relative z-20 mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-6 pt-24 pb-10 md:px-10 lg:px-12">
      <p className="hero-kicker text-[0.68rem] uppercase tracking-[0.28em] text-bronze md:text-xs">
        {business.values.join(" · ")}
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[0.92] tracking-tight text-ivory sm:text-6xl lg:text-7xl">
        <span className="clip-title block">
          <span className="hero-line block">Your Sofa.</span>
        </span>
        <span className="clip-title block italic text-ivory/90">
          <span className="hero-line block">Reimagined.</span>
        </span>
      </h1>
      <div className="hero-copy mt-6 max-w-md">
        <p className="text-sm leading-relaxed text-ivory/85 md:text-base">
          Sofa repair and reupholstery for the pieces you already love — and custom furniture
          built from scratch when you need something new.
        </p>
        <p className="mt-3 text-xs tracking-wide text-ivory/65 md:text-sm">
          Repair, restoration, and made-to-order furniture in Greater Noida West.
        </p>
        <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
          <Button variant="light" onClick={() => goToEnquiry()}>
            Request a Quote
          </Button>
          <Button variant="ghost" href="#services" className="text-ivory">
            Explore Our Services
          </Button>
        </div>
      </div>
    </div>
  );

  if (!cinematic) {
    return (
      <section id="home" ref={root} className="relative flex h-svh items-center overflow-hidden bg-ink text-ivory">
        <div className="hero-frame absolute inset-0">
          <img
            src="/images/hero.jpg"
            alt="Sunlit living room with a leather sofa and lounge chairs — illustrative interior"
            width={2000}
            height={1333}
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-ink/20 to-transparent" />
        </div>
        {copy}
      </section>
    );
  }

  return (
    <section
      id="home"
      ref={root}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-svh"
    >
      <div className="hero-stage h-full overflow-hidden text-ivory">
        <div className="hero-frame absolute inset-0">
          {use3d ? (
            <div className="hero-scene pointer-events-none absolute inset-0">
              <Suspense fallback={null}>
                <HeroScene
                  reduced={reduced}
                  progress={progress}
                  onReady={() => {
                    setReady(true);
                    ScrollTrigger.refresh();
                  }}
                />
              </Suspense>
            </div>
          ) : (
            <div className="hero-css-curtain absolute inset-0">
              <div
                className="curtain-left absolute inset-y-0 left-0 w-1/2 bg-cover bg-left"
                style={{ backgroundImage: "url(/images/curtains.jpg)" }}
              />
              <div
                className="curtain-right absolute inset-y-0 right-0 w-1/2 bg-cover bg-right"
                style={{ backgroundImage: "url(/images/curtains.jpg)" }}
              />
            </div>
          )}
          {use3d ? (
            <div
              className={`absolute inset-0 bg-ink transition-opacity duration-700 ${
                ready ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            />
          ) : null}
          <div className="hero-veil pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/40" />
        </div>
        <div className="h-full">{copy}</div>
      </div>
    </section>
  );
}
