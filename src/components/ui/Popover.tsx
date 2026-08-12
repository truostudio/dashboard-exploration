import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode, RefObject } from 'react';

/** Breathing room kept between the panel and the edge of the window. */
const GUTTER = 12;
/** Gap between the trigger and the panel. */
const OFFSET = 6;

type PopoverProps = {
  /**
   * The trigger's contents. Gets `open` so it can render its own state; the
   * button element itself, and the ref it needs, belong to the popover.
   */
  trigger: (open: boolean) => ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
  /** Names the panel for screen readers. */
  label: string;
  /** Preferred edge. Overruled by the clamp when that edge does not fit. */
  align?: 'left' | 'right';
  /** Extra class on the panel, for width and per-use trim. */
  className?: string;
  /** Pinned footer, outside the scrolling body. */
  foot?: (close: () => void) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
};

/**
 * Trigger plus a panel positioned against the *window*.
 *
 * Absolute positioning put the panel off-screen wherever the trigger sat near
 * an edge, and left it at the mercy of any clipping ancestor. This measures the
 * panel, prefers the requested edge, and clamps it back inside the viewport on
 * both axes, so filters, notifications, and anything else that drops a panel
 * behave the same at every screen size.
 */
export function Popover({
  trigger,
  triggerClassName = 'btn',
  triggerLabel,
  label,
  align = 'left',
  className = '',
  foot,
  children,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  const place = useCallback(() => {
    const t = triggerRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!t || !menu) return;
    const m = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const preferred = align === 'right' ? t.right - m.width : t.left;
    const left = Math.max(GUTTER, Math.min(preferred, vw - m.width - GUTTER));

    // Drop below unless there is not room and there is more of it above.
    const below = vh - t.bottom - OFFSET - GUTTER;
    const above = t.top - OFFSET - GUTTER;
    const flip = m.height > below && above > below;
    // Clamped on both branches: a trigger can scroll out of the window while
    // the panel is open, and an unclamped drop-below then puts the panel at a
    // negative top with its footer off the screen.
    const top = Math.max(
      GUTTER,
      Math.min(flip ? t.top - OFFSET - m.height : t.bottom + OFFSET, vh - m.height - GUTTER),
    );

    // Written straight to the node rather than through state: this runs on
    // every scroll frame while the panel is open, and a re-render per frame to
    // move a fixed box is a re-render nobody needs.
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.setProperty('--pop-max-h', `${Math.max(160, flip ? above : below)}px`);
    menu.style.visibility = 'visible';
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    // Capture phase, so the panel tracks a scrolling ancestor and not just the
    // window.
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <div className="popover-anchor">
      <button
        type="button"
        ref={triggerRef}
        className={triggerClassName}
        aria-label={triggerLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger(open)}
      </button>

      {/* Portalled to the body. `position: fixed` is measured against the
          nearest ancestor carrying a transform, and the entrance animation on
          the surrounding panels leaves `translateY(0)` behind under a forwards
          fill, enough to make that panel the containing block and to land the
          menu hundreds of pixels from where it was placed. */}
      {open && createPortal(
        <>
          <div
            ref={menuRef}
            className={`popover ${className}`.trim()}
            role="dialog"
            aria-label={label}
            /* Hidden until placed: it has to be measured somewhere before it
               can be positioned, and that measurement should not be visible. */
            style={{ left: 0, top: 0, visibility: 'hidden' }}
          >
            <div className="popover-body">
              {typeof children === 'function' ? children(close) : children}
            </div>
            {foot && <div className="popover-foot">{foot(close)}</div>}
          </div>
          <div className="popover-backdrop" onClick={close} />
        </>,
        document.body,
      )}
    </div>
  );
}

export type { RefObject };
