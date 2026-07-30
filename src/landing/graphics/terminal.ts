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
 * Terminal-style cycle: keep a fixed prefix, type a path fast, hold, erase,
 * then move to the next. Reduced motion shows the first full line and stops.
 */
export function useTypedCycle(
  prefix: string,
  paths: readonly string[],
  {
    typeMs = 16,
    eraseMs = 10,
    holdMs = 1400,
  }: { typeMs?: number; eraseMs?: number; holdMs?: number } = {},
) {
  const list = paths.length > 0 ? paths : [''];
  const [shown, setShown] = useState(() =>
    reduced() ? prefix + list[0] : prefix,
  );

  useEffect(() => {
    // The reduced-motion value is already set by the initialiser; writing it
    // again here is a setState in an effect body for no gain.
    if (reduced()) return;

    let alive = true;
    let timer = 0;
    let idx = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const run = async () => {
      while (alive) {
        const target = list[idx] ?? '';
        for (let c = 0; c <= target.length && alive; c++) {
          setShown(prefix + target.slice(0, c));
          if (c < target.length) await wait(typeMs);
        }
        if (!alive) break;
        await wait(holdMs);
        if (!alive) break;
        for (let c = target.length; c >= 0 && alive; c--) {
          setShown(prefix + target.slice(0, c));
          if (c > 0) await wait(eraseMs);
        }
        if (!alive) break;
        idx = (idx + 1) % list.length;
        await wait(160);
      }
    };

    void run();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // list is compared by joined key so callers can pass a stable literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefix, list.join('\0'), typeMs, eraseMs, holdMs]);

  return shown;
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
