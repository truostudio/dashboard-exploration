import { useEffect } from 'react';

/**
 * Scroll choreography. Anything marked `data-reveal` starts translated and
 * settles when it first enters the viewport; `data-revealed` is the flag the
 * stylesheet keys off. One observer for the whole page rather than a hook per
 * component, so sections stay plain markup.
 *
 * Elements added later (a tab switching its rows) are picked up by the mutation
 * observer, only new nodes are scanned, not the whole tree on every DOM churn.
 * Under `prefers-reduced-motion` everything is revealed immediately.
 */
export function useReveal(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const reveal = (el: Element) => el.setAttribute('data-revealed', '');

    if (reduce) {
      document.querySelectorAll('[data-reveal]').forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      },
      // Fire a little before the element is fully on screen, so the motion
      // reads as the page settling rather than as things popping in late.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );

    const watch = (el: Element) => {
      if (!(el instanceof Element)) return;
      if (el.hasAttribute('data-reveal') && !el.hasAttribute('data-revealed')) {
        io.observe(el);
      }
      for (const child of el.querySelectorAll('[data-reveal]:not([data-revealed])')) {
        io.observe(child);
      }
    };

    document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => io.observe(el));

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) watch(node as Element);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [enabled]);
}

/**
 * Tracks how far the page has scrolled through an element, 0–1, and writes it
 * to a CSS custom property on that element. Used by the pinned sequence so the
 * progress rail and active card are driven by scroll position, not by a timer.
 */
export function useScrollProgress(selector: string, property = '--p') {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      if (span <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / span));
      el.style.setProperty(property, String(p));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [selector, property]);
}
