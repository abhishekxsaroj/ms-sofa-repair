import { business } from "../lib/business";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink py-16 text-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <Logo invert />
          <p className="mt-6 max-w-sm text-ivory/60">{business.tagline}</p>
        </div>
        <div className="space-y-3 text-sm md:col-span-3">
          <p className="text-xs uppercase tracking-[0.18em] text-bronze">Contact</p>
          <p>{business.contactName}</p>
          <a href={`tel:${business.phoneTel}`}>{business.phoneDisplay}</a>
          <a className="block" href={`mailto:${business.email}`}>
            {business.email}
          </a>
        </div>
        <div className="space-y-3 text-sm md:col-span-4">
          <p className="text-xs uppercase tracking-[0.18em] text-bronze">Studio</p>
          {business.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-14 grid max-w-7xl gap-3 px-5 text-xs text-ivory/40 md:grid-cols-3 md:items-center md:px-8">
        <p>© {new Date().getFullYear()} {business.name}</p>
        <p className="text-center">
          Design &amp; developed by{" "}
          <a
            href="https://abhishek-portfolio-pink-two.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-ivory/70 transition-colors hover:text-bronze"
          >
            Abhishek
          </a>
        </p>
        <p className="md:text-right">Greater Noida West · Repair, furnishing &amp; custom furniture</p>
      </div>
    </footer>
  );
}
