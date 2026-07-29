import { useEffect, useRef, useState } from 'react';

/**
 * The timing primitives the workspace runs on. Kept apart from `Window.tsx`
 * so that file only exports components and stays fast-refreshable.
 */

const reduced = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** Cycles 0…n-1 on an interval. Honours reduced motion by never starting. */
export function useCycle(n: number, ms: number) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (n < 2 || reduced()) return;
    const id = setInterval(() => setI((v) => (v + 1) % n), ms);
    return () => clearInterval(id);
  }, [n, ms]);

  return i;
}

/**
 * Reveals `text` one character at a time, then holds. The reduced-motion case
 * is decided in the initialiser rather than in an effect, so the full string
 * is the first thing rendered instead of a frame of nothing.
 */
export function useTypedText(text: string, speed = 44) {
  const [n, setN] = useState(() => (reduced() ? text.length : 0));

  useEffect(() => {
    if (reduced()) return;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return text.slice(0, n);
}

/**
 * True once the element has been on screen — so a window at the bottom of the
 * page isn't already twelve seconds into its animation when it is reached.
 */
export function useVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return [ref, seen] as const;
}
