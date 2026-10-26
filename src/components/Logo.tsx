type LogoProps = {
  className?: string;
  variant?: "mark" | "lockup";
  invert?: boolean;
};

export function Logo({ className = "", variant = "lockup", invert = false }: LogoProps) {
  const color = invert ? "#EDE6D8" : "#C4A574";

  const mark = (
    <svg
      className="logo-mark h-10 w-10 shrink-0"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 30 L32 8 L56 30"
        stroke={color}
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M13 30 V54 H51 V30"
        stroke={color}
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M32 16 V24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M26.5 24 L32 30.5 L37.5 24 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 47.5 V42 H22.5 V38.2 C22.5 36.7 23.7 35.5 25.2 35.5 H38.8 C40.3 35.5 41.5 36.7 41.5 38.2 V42 H44 V47.5 H20Z"
        fill={color}
      />
    </svg>
  );

  if (variant === "mark") {
    return (
      <span className={`inline-flex ${className}`} aria-hidden="true">
        {mark}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      <span className="leading-none">
        <span
          className="block font-display text-[1.25rem] font-semibold tracking-tight"
          style={{ color }}
        >
          MS Sofa
        </span>
        <span
          className="mt-1 block text-[0.55rem] font-medium uppercase tracking-[0.2em]"
          style={{ color }}
        >
          Repair &amp; Furnishing
        </span>
      </span>
    </span>
  );
}
