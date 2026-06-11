import { useEffect, useRef, useState } from 'react';

type Props = {
  /** A formatted value like "2,410,442", "99.94%", "78 ms", "14". */
  value: string;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
};

/** Splits "78 ms" -> { prefix:"", num:78, suffix:" ms", decimals:0, grouped:false } */
function parse(value: string) {
  const match = value.match(/^(\D*?)([\d.,]+)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  const plain = numStr.replace(/,/g, '');
  const dot = plain.indexOf('.');
  const decimals = dot === -1 ? 0 : plain.length - dot - 1;
  return {
    prefix,
    suffix,
    target: parseFloat(plain),
    decimals,
    grouped: numStr.includes(','),
  };
}

function format(n: number, decimals: number, grouped: boolean) {
  return grouped
    ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : n.toFixed(decimals);
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function AnimatedNumber({ value, duration = 1100, className }: Props) {
  const parsed = parse(value);
  const [display, setDisplay] = useState(() =>
    parsed ? format(parsed.target, parsed.decimals, parsed.grouped) : value,
  );
  const fromRef = useRef(0);

  useEffect(() => {
    if (!parsed) {
      setDisplay(value);
      return;
    }
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(format(parsed.target, parsed.decimals, parsed.grouped));
      return;
    }

    const from = fromRef.current;
    const to = parsed.target;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const current = from + (to - from) * easeOutExpo(t);
      setDisplay(format(current, parsed.decimals, parsed.grouped));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  if (!parsed) return <span className={className}>{value}</span>;
  return (
    <span className={className}>
      {parsed.prefix}
      {display}
      {parsed.suffix}
    </span>
  );
}
