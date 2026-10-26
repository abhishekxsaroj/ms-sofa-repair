import { useCallback, useRef, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type Variant = "primary" | "light" | "ghost";

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = Common & {
  href: string;
  target?: string;
  rel?: string;
};

function useStickyButton() {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el || reduced) return;
      if (el instanceof HTMLButtonElement && el.disabled) return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
      el.style.transform = `translate3d(${dx * 0.32}px, ${dy * 0.4}px, 0)`;
    },
    [reduced],
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate3d(0, 0, 0)";
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, variant = "primary", className = "" } = props;
  const classes = `btn btn-${variant} ${className}`.trim();
  const sticky = useStickyButton();
  const inner = (
    <>
      <span className="btn-magnet" aria-hidden="true" />
      <span>{children}</span>
    </>
  );

  if ("href" in props && props.href) {
    return (
      <a
        ref={(node) => {
          sticky.ref.current = node;
        }}
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={classes}
        onPointerMove={sticky.onPointerMove}
        onPointerLeave={sticky.onPointerLeave}
      >
        {inner}
      </a>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button
      ref={(node) => {
        sticky.ref.current = node;
      }}
      type={buttonProps.type || "button"}
      className={classes}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      onPointerMove={sticky.onPointerMove}
      onPointerLeave={sticky.onPointerLeave}
    >
      {inner}
    </button>
  );
}
