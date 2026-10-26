import { useCallback, useRef, useState } from "react";

type BeforeAfterProps = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
};

export function BeforeAfter({ before, after, beforeAlt, afterAlt }: BeforeAfterProps) {
  const [amount, setAmount] = useState(46);
  const frame = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setAmount(Math.min(92, Math.max(8, next)));
  }, []);

  return (
    <div
      ref={frame}
      className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-espresso"
      onPointerDown={(event) => {
        (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
        updateFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          updateFromClientX(event.clientX);
        }
      }}
    >
      <img src={after} alt={afterAlt} className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - amount}% 0 0)` }}
      >
        <img src={before} alt={beforeAlt} className="h-full w-full object-cover" />
      </div>
      <div
        className="absolute inset-y-0 z-10 w-px bg-ivory"
        style={{ left: `${amount}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-[0.62rem] tracking-[0.18em] text-ink uppercase">
          Drag
        </div>
      </div>
      <input
        type="range"
        min={8}
        max={92}
        value={amount}
        aria-label="Compare illustrative before and after interiors"
        className="absolute inset-0 z-20 cursor-ew-resize opacity-0"
        onChange={(event) => setAmount(Number(event.target.value))}
      />
    </div>
  );
}
