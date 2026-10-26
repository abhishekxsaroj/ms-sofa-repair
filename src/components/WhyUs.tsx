import { commitments } from "../lib/business";

export function WhyUs() {
  return (
    <section id="about" className="bg-espresso py-24 text-ivory md:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-16 px-5 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.22em] text-bronze">Why choose us</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
            Made for Comfort. Focused on Quality.
          </h2>
          <p className="mt-6 max-w-md text-ivory/65">
            We repair and restore the furniture you already have, and we build new pieces
            from scratch — with attention to comfort, style, and careful workmanship.
          </p>
          <div className="relative mt-12">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-bronze/40" />
            <img
              src="/images/detail.jpg"
              alt="Illustrative close view of sofa upholstery and cushions"
              loading="lazy"
              className="relative aspect-[4/5] w-full rounded-[3rem] object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pt-24">
          <ol>
            {commitments.map((item, index) => (
              <li key={item.title} className="py-8 first:pt-0">
                <p className="text-xs tracking-[0.2em] text-bronze">0{index + 1}</p>
                <h3 className="mt-3 font-display text-3xl">{item.title}</h3>
                <p className="mt-3 max-w-md text-ivory/65">{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
