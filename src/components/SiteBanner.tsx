import { useMemo, useState } from 'react';
import { Icon } from './Icons';
import { siteMessages } from '../data/banner';
import type { BannerMessage } from '../data/banner';
import type { ViewId } from '../App';

/**
 * The persistent readout above the shell.
 *
 * It carries a queue, not a single message, and the queue is stepped by hand:
 * nothing rotates on a timer. An auto-advancing banner takes the one line
 * someone is halfway through reading and replaces it, and on a line that says
 * how many requests you just lost, that is the worst possible moment to do it.
 * Prev/next use the same pager idiom as the tables, so stepping through
 * messages is a control the app has already taught.
 *
 * Dismissal is per message, not per banner: closing the announcement should not
 * also close the incident sitting behind it.
 */

const key = (id: string) => `ub-banner:${id}`;

function readDismissed(messages: BannerMessage[]): string[] {
  try {
    return messages.filter((m) => localStorage.getItem(key(m.id)) === '1').map((m) => m.id);
  } catch {
    // Private mode. Nothing is remembered, which is the safe direction here.
    return [];
  }
}

type Props = {
  onNavigate: (id: ViewId) => void;
};

/** Matches the collapse transition in `.site-banner.is-leaving`. */
const LEAVE_MS = 260;

export function SiteBanner({ onNavigate }: Props) {
  const messages = useMemo(() => siteMessages(), []);
  const [dismissed, setDismissed] = useState(() => readDismissed(messages));
  const [index, setIndex] = useState(0);
  /** Which way the queue last moved, so the next message enters from that side. */
  const [back, setBack] = useState(false);
  /** Set while the last message plays its exit. Nothing cuts straight to gone. */
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const live = messages.filter((m) => !dismissed.includes(m.id));
  if (gone || !live.length) return null;

  // Dismissing the last message in the queue leaves the index past the end.
  const at = Math.min(index, live.length - 1);
  const message = live[at];
  const alert = message.severity === 'alert';

  function remember(m: typeof message) {
    // An alert is a live condition: it comes back next session if it is still
    // true. Only an announcement earns a permanent dismissal.
    if (m.severity === 'alert') return;
    try {
      localStorage.setItem(key(m.id), '1');
    } catch {
      // Dismissal lasts for this session only.
    }
  }

  function dismiss() {
    remember(message);
    // The last one collapses the band on the way out; the others hand over to
    // the next message, which slides in behind them.
    if (live.length === 1) {
      setLeaving(true);
      setTimeout(() => { setGone(true); setDismissed((prev) => [...prev, message.id]); }, LEAVE_MS);
      return;
    }
    setBack(false);
    setDismissed((prev) => [...prev, message.id]);
  }

  const step = (delta: number) => {
    setBack(delta < 0);
    setIndex((prev) => {
      const from = Math.min(prev, live.length - 1);
      return (from + delta + live.length) % live.length;
    });
  };

  return (
    <div
      className={`site-banner ${alert ? 'is-alert' : ''} ${leaving ? 'is-leaving' : ''}`.replace(/\s+/g, ' ').trim()}
      role="region"
      aria-label={alert ? 'Service alert' : 'Announcement'}
    >
      {/* Keyed on the message so the whole line remounts and slides in: the
          prompt, the tag and the copy all change together, and stepping the
          queue reads as a move rather than the text being overwritten. */}
      <div
        className={`site-banner-line swap-in ${back ? 'is-back' : ''}`.trim()}
        key={message.id}
      >
        <span className="site-banner-prompt" aria-hidden>
          {alert ? '!' : '›'}
        </span>
        <span className="site-banner-tag">{message.tag}</span>
        <span className="site-banner-sep" aria-hidden>
          ·
        </span>
        {/* Polite, not assertive: the message is already on screen, and stepping
            through the queue should be read out after whatever the user is
            doing, never over the top of it. */}
        <p className="site-banner-msg" aria-live="polite">{message.text}</p>
        {/* Outside the truncating paragraph on purpose. An incident that has
            been ellipsised down to a number with nowhere to go is worse than no
            banner: the whole reason it is up there is the way out. */}
        {message.links && (
          <span className="site-banner-actions">
            {message.links.map((link) => (
              <button
                key={link.label}
                type="button"
                className="site-banner-link"
                onClick={() => onNavigate(link.view)}
              >
                {link.label}
              </button>
            ))}
          </span>
        )}
      </div>

      <div className="site-banner-controls">
        {live.length > 1 && (
          <div className="pager site-banner-pager">
            <button
              className="btn ghost icon-only"
              onClick={() => step(-1)}
              aria-label="Previous message"
            >
              <Icon.Chevron size={14} className="flip" />
            </button>
            <span className="mono dim">
              {at + 1} / {live.length}
            </span>
            <button
              className="btn ghost icon-only"
              onClick={() => step(1)}
              aria-label="Next message"
            >
              <Icon.Chevron size={14} />
            </button>
          </div>
        )}
        <button
          type="button"
          className="btn ghost icon-only site-banner-close"
          aria-label={`Dismiss ${alert ? 'alert' : 'announcement'}`}
          onClick={dismiss}
        >
          <Icon.X size={14} />
        </button>
      </div>
    </div>
  );
}
