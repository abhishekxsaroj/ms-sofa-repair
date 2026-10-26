import { useState } from "react";
import { gallery } from "../lib/business";

export function Gallery() {
  const [active, setActive] = useState<string | null>(null);
  const selected = gallery.find((item) => item.src === active);

  return (
    <section id="gallery" className="bg-ivory py-24 text-ink md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue">Gallery</p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">Rooms, fabrics, forms.</h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">
            Illustrative interiors and furniture details. These photographs are not
            photographs of completed customer projects.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-7xl grid-cols-2 gap-3 px-5 md:grid-cols-12 md:gap-5 md:px-8">
        {gallery.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActive(item.src)}
            className={`group relative overflow-hidden bg-cream ${
              "wide" in item && item.wide ? "col-span-2 md:col-span-8" : "col-span-1 md:col-span-4"
            } ${index === 1 || index === 4 ? "aspect-[3/4]" : "aspect-[4/3]"}`}
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-5"
          role="dialog"
          aria-modal="true"
          aria-label={selected.alt}
          onClick={() => setActive(null)}
        >
          <img
            src={selected.src}
            alt={selected.alt}
            className="max-h-[86vh] max-w-5xl object-contain"
          />
          <button
            type="button"
            className="absolute top-5 right-5 text-xs uppercase tracking-[0.2em] text-ivory"
            onClick={() => setActive(null)}
          >
            Close
          </button>
        </div>
      ) : null}
    </section>
  );
}
