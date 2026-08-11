import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
};

type Variant = 'seg' | 'tab';

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * seg: filled block thumb, for filters and mode switches

   * tab: sliding underline, for view-level navigation
   */
  variant?: Variant;
  label?: string;
  className?: string;
};

/**
 * One segmented control for every toggle in the app. The active marker is a
 * single element that travels between options rather than appearing in place,
 * which is what makes the interaction feel physical.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  variant = 'seg',
  label,
  className = '',
}: Props<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<T, HTMLButtonElement>());
  const [marker, setMarker] = useState<{ left: number; width: number } | null>(null);
  // Suppress the travel animation on first paint so it doesn't fly in from 0.
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const el = itemRefs.current.get(value);
    if (!el) return;
    setMarker({ left: el.offsetLeft, width: el.offsetWidth });

    // When the row is wider than its box it scrolls, and the selected option
    // can sit off-screen, and you then can't see which one is active. Nudge the
    // list itself rather than calling scrollIntoView, which would also scroll
    // the page vertically to reach it.
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const pad = 12;
    const left = el.offsetLeft - pad;
    const right = el.offsetLeft + el.offsetWidth + pad;
    if (left < list.scrollLeft) list.scrollLeft = left;
    else if (right > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = right - list.clientWidth;
    }
  }, [value]);

  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const el of itemRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [measure, options]);

  useLayoutEffect(() => {
    if (marker && !ready) {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [marker, ready]);

  const isTabs = variant === 'tab';

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !back) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next = forward
      ? (index + 1) % options.length
      : (index - 1 + options.length) % options.length;
    onChange(options[next].value);
    itemRefs.current.get(options[next].value)?.focus();
  }

  return (
    <div
      ref={listRef}
      className={`sgm sgm-${variant} ${className}`}
      role={isTabs ? 'tablist' : 'radiogroup'}
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {marker && (
        <span
          className={`sgm-marker ${ready ? 'ready' : ''}`}
          aria-hidden
          style={{ transform: `translateX(${marker.left}px)`, width: marker.width }}
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              if (el) itemRefs.current.set(option.value, el);
              else itemRefs.current.delete(option.value);
            }}
            type="button"
            role={isTabs ? 'tab' : 'radio'}
            aria-selected={isTabs ? selected : undefined}
            aria-checked={isTabs ? undefined : selected}
            tabIndex={selected ? 0 : -1}
            className={`sgm-item ${selected ? 'on' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
