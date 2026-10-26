export function scrollToHome(event?: { preventDefault?: () => void }) {
  event?.preventDefault?.();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

export function scrollToHash(href: string, event?: { preventDefault?: () => void }) {
  if (href === "#home" || href === "/") {
    scrollToHome(event);
    return;
  }

  const id = href.startsWith("#") ? href.slice(1) : href;
  const target = document.getElementById(id);
  if (!target) return;

  event?.preventDefault?.();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
