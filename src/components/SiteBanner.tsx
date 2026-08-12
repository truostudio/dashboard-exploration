import { useState } from 'react';
import { Icon } from './Icons';
import type { ViewId } from '../App';

/** Bump the id when the announcement copy changes so a prior dismiss doesn't hide the new one. */
const BANNER_ID = 'hyperliquid-direct-jsonrpc';
const STORAGE_KEY = `ub-banner:${BANNER_ID}`;

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

type Props = {
  onNavigate: (id: ViewId) => void;
};

export function SiteBanner({ onNavigate }: Props) {
  const [open, setOpen] = useState(() => !wasDismissed());

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Private mode, dismiss lasts for this session only.
    }
  };

  return (
    <div className="site-banner" role="region" aria-label="Announcement">
      <div className="site-banner-line">
        <span className="site-banner-prompt" aria-hidden>
          ›
        </span>
        <span className="site-banner-tag">Notice</span>
        <span className="site-banner-sep" aria-hidden>
          ·
        </span>
        <p className="site-banner-msg">
          Hyperliquid now available on{' '}
          <button type="button" className="site-banner-link" onClick={() => onNavigate('apis-direct')}>
            Direct APIs
          </button>
          {' '}and{' '}
          <button type="button" className="site-banner-link" onClick={() => onNavigate('json-rpc')}>
            JSON-RPCs
          </button>
        </p>
      </div>
      <button
        type="button"
        className="btn ghost icon-only site-banner-close"
        aria-label="Dismiss announcement"
        onClick={dismiss}
      >
        <Icon.X size={14} />
      </button>
    </div>
  );
}
