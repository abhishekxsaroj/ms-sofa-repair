import { useEffect, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { business } from "../lib/business";
import { scrollToHash, scrollToHome } from "../lib/scrollTo";
import { useEnquiry } from "../context/EnquiryContext";
import { Button } from "./Button";
import { Logo } from "./Logo";

const links = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const { goToEnquiry } = useEnquiry();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(href: string, event: MouseEvent) {
    scrollToHash(href, event);
    setOpen(false);
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:px-6 md:pt-5">
      <div
        className={`glass-nav pointer-events-auto w-full max-w-5xl text-ivory ${
          open ? "rounded-[2rem]" : "rounded-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2 md:px-4">
          <a
            href="#home"
            className="shrink-0 pl-1"
            aria-label={business.name}
            onClick={(event) => {
              scrollToHome(event);
              setOpen(false);
            }}
          >
            <Logo invert />
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link text-ivory/80 hover:text-ivory"
                onClick={(event) => go(link.href, event)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Button variant="primary" onClick={() => goToEnquiry()}>
                Request a Quote
              </Button>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open ? (
          <div id="mobile-menu" className="px-6 pb-6 pt-2 lg:hidden">
            <nav className="flex flex-col gap-4" aria-label="Mobile">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-display text-3xl text-ivory"
                  onClick={(event) => go(link.href, event)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-6">
              <Button
                onClick={() => {
                  setOpen(false);
                  goToEnquiry();
                }}
              >
                Request a Quote
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
