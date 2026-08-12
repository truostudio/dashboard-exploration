import { useState } from 'react';
import { Icon } from './Icons';
import { Popover, Empty } from './ui';
import { notifications as seed } from '../data/mock';
import type { Notification, NotificationKind } from '../data/mock';
import type { ViewId } from '../App';

/** Each kind gets one mark, so the feed can be read by shape before by word. */
const kindIcon: Record<NotificationKind, keyof typeof Icon> = {
  news: 'Rocket',
  status: 'Route',
  account: 'Alert',
};

export function Notifications({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const [items, setItems] = useState<Notification[]>(seed);
  const unread = items.filter((n) => n.unread).length;

  const read = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <Popover
      label="Notifications"
      align="right"
      className="notif-pop"
      triggerClassName="btn ghost icon-only notif-trigger"
      triggerLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      trigger={() => (
        <>
          <Icon.Bell size={15} />
          {/* A count, not a dot: three unread and thirty are different days. */}
          {unread > 0 && <span className="notif-badge mono">{unread}</span>}
        </>
      )}
      foot={(close) => (
        <>
          <button
            type="button"
            className="filter-pop-clear"
            disabled={unread === 0}
            onClick={() => setItems((list) => list.map((n) => ({ ...n, unread: false })))}
          >
            Mark all read
          </button>
          <button type="button" className="btn small" onClick={close}>Close</button>
        </>
      )}
    >
      {(close) => (
        <>
          <header className="notif-head">
            <span className="eyebrow">Notifications</span>
            {unread > 0 && <span className="mono dim">{unread} new</span>}
          </header>

          {items.length === 0 ? (
            <Empty bare icon={<Icon.Bell size={20} />} title="Nothing new" />
          ) : (
            <ul className="notif-list">
              {items.map((n) => {
                const I = Icon[kindIcon[n.kind]];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`notif-row ${n.unread ? 'is-unread' : ''}`.trim()}
                      onClick={() => {
                        read(n.id);
                        if (n.target) { onNavigate(n.target); close(); }
                      }}
                    >
                      <span className={`notif-mark is-${n.kind}`} aria-hidden><I size={14} /></span>
                      <span className="notif-text">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-body dim">{n.body}</span>
                        <span className="notif-meta">
                          <span className="mono dim">{n.ago}</span>
                          {n.cta && <span className="notif-cta">{n.cta} <Icon.Chevron size={11} /></span>}
                        </span>
                      </span>
                      {n.unread && <span className="notif-dot" aria-label="Unread" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Popover>
  );
}
