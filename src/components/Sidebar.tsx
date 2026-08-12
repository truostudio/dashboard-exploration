import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './Icons';
import { projects, cuUsed, cuLimit } from '../data/mock';
import type { ViewId } from '../App';

type Badge = { text: string; tone?: 'blue' | 'orange' | 'green' };

type NavLeaf = {
  id: ViewId;
  label: string;
  icon?: keyof typeof Icon;
  badge?: Badge;
};

type NavGroup = {
  key: string;
  label: string;
  icon: keyof typeof Icon;
  badge?: Badge;
  children: NavLeaf[];
};

type NavEntry = NavLeaf | NavGroup;

function isGroup(e: NavEntry): e is NavGroup {
  return (e as NavGroup).children !== undefined;
}

/**
 * Sections, not a disclosure group.
 *
 * The old rail put Unified and Direct inside an "APIs" dropdown and left
 * JSON-RPC outside it as a sibling, which quietly claimed JSON-RPC is not an
 * API. It is one of the three request surfaces the product is built on
 * (Unified, JSON-RPC, Direct), and the docs treat them as peers, so the nav
 * does too now.
 *
 * Section headers were already the pattern here for Project and Settings; the
 * dropdown was the one exception, and it cost a click to hide three leaves on a
 * rail with room for all of them.
 */
type NavSection = { label: string; items: NavEntry[] };

const NAV: NavSection[] = [
  {
    label: 'Project',
    items: [
      { id: 'overview',  label: 'Overview',  icon: 'Grid' },
      { id: 'analytics', label: 'Analytics', icon: 'Chart' },
    ],
  },
  {
    // The three surfaces you can call, plus the two catalogues over them.
    label: 'APIs',
    items: [
      { id: 'apis-unified', label: 'Unified',    icon: 'Code' },
      { id: 'json-rpc',     label: 'JSON-RPC',   icon: 'Tx' },
      { id: 'apis-direct',  label: 'Direct',     icon: 'Route' },
      { id: 'chains',       label: 'Chains',     icon: 'Cube' },
      { id: 'apis-all',     label: 'Browse all', icon: 'Search' },
    ],
  },
  {
    // Grouped as the docs group them. Webhooks was a lone top-level item and
    // Nodes was a conditional child of it, which made node infrastructure a
    // kind of webhook.
    label: 'Real-time',
    items: [
      { id: 'webhooks', label: 'Webhooks', icon: 'Webhook', badge: { text: '2', tone: 'orange' } },
      { id: 'nodes',    label: 'Nodes',    icon: 'Nodes' },
    ],
  },
  {
    label: 'Tools',
    items: [{ id: 'api-tester', label: 'API Tester', icon: 'Beaker' }],
  },
  {
    label: 'Settings',
    items: [
      { id: 'settings-project', label: 'Project', icon: 'Folder' },
      { id: 'settings-team',    label: 'Team',    icon: 'Users' },
      { id: 'settings-billing', label: 'Billing', icon: 'Card' },
    ],
  },
  {
    /** Internal only. Not part of the customer-facing product. */
    label: 'Developer',
    items: [{ id: 'components', label: 'Components', icon: 'Grid' }],
  },
];

/** Compute units run to the millions, so the rail shows them abbreviated. */
function formatCu(n: number) {
  const m = n / 1_000_000;
  return `${m >= 10 ? Math.round(m) : m.toFixed(1)}M`;
}

function NavBadge({ badge }: { badge: Badge }) {
  return <span className={`nav-badge ${badge.tone ?? 'blue'}`}>{badge.text}</span>;
}

type LeafProps = { item: NavLeaf; view: ViewId; onNavigate: (id: ViewId) => void };

function NavLeafItem({ item, view, onNavigate }: LeafProps) {
  const I = item.icon ? Icon[item.icon] : null;
  return (
    <button
      className={`nav-item ${view === item.id ? 'active' : ''}`}
      onClick={() => onNavigate(item.id)}
    >
      {I && <I size={14} />}
      <span className="nav-label">{item.label}</span>
      {item.badge && <NavBadge badge={item.badge} />}
    </button>
  );
}

type GroupProps = { group: NavGroup; view: ViewId; onNavigate: (id: ViewId) => void };

function NavGroupItem({ group, view, onNavigate }: GroupProps) {
  const childActive = group.children.some((c) => c.id === view);
  const [open, setOpen] = useState(childActive);

  // Open the group when one of its children becomes active elsewhere.
  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const I = Icon[group.icon];

  return (
    <div className="nav-group">
      <button
        className={`nav-item nav-parent ${childActive && !open ? 'has-active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <I size={14} />
        <span className="nav-label">{group.label}</span>
        {group.badge && <NavBadge badge={group.badge} />}
        <Icon.ChevronDown size={12} className={`nav-caret ${open ? 'open' : ''}`} />
      </button>

      <div className={`nav-sub-wrap ${open ? 'open' : ''}`}>
        <div className="nav-sub">
          {group.children.map((c) => (
            <button
              key={c.id}
              className={`nav-child ${view === c.id ? 'active' : ''}`}
              onClick={() => onNavigate(c.id)}
            >
              <span className="nav-label">{c.label}</span>
              {c.badge && <NavBadge badge={c.badge} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type Props = {
  view: ViewId;
  onNavigate: (id: ViewId) => void;
  onNewProject: () => void;
  quickstartProgress: { done: number; total: number };
  open?: boolean;
};

export function Sidebar({ view, onNavigate, onNewProject, quickstartProgress, open: drawerOpen }: Props) {
  const [project, setProject] = useState(projects[0].id);
  const [open, setOpen] = useState(false);

  const qs = quickstartProgress;
  const qsPct = Math.round((qs.done / qs.total) * 100);
  const qsActive = view === 'quickstart';
  const cuPct = Math.round((cuUsed / cuLimit) * 100);

  // A single marker travels to whichever row is active, matching the
  // segmented controls elsewhere in the app.
  const navRef = useRef<HTMLElement>(null);
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(null);
  const [markerReady, setMarkerReady] = useState(false);

  const measureMarker = useCallback(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('.nav-item.active, .nav-child.active');
    if (!nav || !active) {
      setMarker(null);
      return;
    }
    setMarker({ top: active.offsetTop, height: active.offsetHeight });
  }, []);

  useLayoutEffect(() => {
    measureMarker();
    const nav = navRef.current;
    if (!nav) return;
    // Fires while a nav group expands or collapses, keeping the marker glued on.
    const observer = new ResizeObserver(measureMarker);
    observer.observe(nav);
    for (const child of nav.querySelectorAll('.nav-sub-wrap')) observer.observe(child);
    return () => observer.disconnect();
  }, [measureMarker, view]);

  useLayoutEffect(() => {
    if (marker && !markerReady) {
      const id = requestAnimationFrame(() => setMarkerReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [marker, markerReady]);

  return (
    <aside className={`sidebar ${drawerOpen ? 'open' : ''}`}>
      <div className="sb-top">
        <div className="brand">
          <img
            src="/uniblock-logo.png"
            alt="Uniblock"
            className="brand-logo"
            width={112}
          />
        </div>

        <button
          className="project-switcher"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="ps-dot" aria-hidden />
          <span className="ps-name">{project}</span>
          <Icon.ChevronDown size={12} />
        </button>

        {open && (
          <div className="ps-menu" role="listbox">
            {projects.map((p) => (
              <button
                key={p.id}
                role="option"
                aria-selected={project === p.id}
                className={`ps-item ${project === p.id ? 'active' : ''}`}
                onClick={() => {
                  setProject(p.id);
                  setOpen(false);
                }}
              >
                <span className="ps-dot" aria-hidden />
                <span className="ps-item-name">{p.id}</span>
                <span className="badge">{p.env}</span>
              </button>
            ))}
            <div className="ps-sep" />
            <button
              className="ps-item create"
              onClick={() => {
                setOpen(false);
                onNewProject();
              }}
            >
              <Icon.Plus size={12} />
              <span>New project…</span>
            </button>
          </div>
        )}
      </div>

      <nav className="sb-nav" aria-label="Project" ref={navRef}>
        {marker && (
          <span
            className={`nav-marker ${markerReady ? 'ready' : ''}`}
            aria-hidden
            style={{ transform: `translateY(${marker.top}px)`, height: marker.height }}
          />
        )}
        <button
          className={`qs-card ${qsActive ? 'active' : ''}`}
          onClick={() => onNavigate('quickstart')}
        >
          <div className="qs-row">
            <span className="qs-label">Quickstart</span>
            <span className="qs-progress mono">{qs.done}/{qs.total}</span>
          </div>
          <div className="qs-bar" aria-hidden>
            <div className="qs-bar-fill" style={{ width: `${qsPct}%` }} />
          </div>
          <span className="qs-hint dim">
            {qs.done === qs.total ? 'All set. Explore the docs' : 'Make your first API call'}
          </span>
        </button>

        {NAV.map((section) => (
          <Fragment key={section.label}>
            <div className="sb-section-label">{section.label}</div>
            {section.items.map((entry) =>
              isGroup(entry) ? (
                <NavGroupItem key={entry.key} group={entry} view={view} onNavigate={onNavigate} />
              ) : (
                <NavLeafItem key={entry.id} item={entry} view={view} onNavigate={onNavigate} />
              ),
            )}
          </Fragment>
        ))}
      </nav>

      <div className="sb-bottom">
        <a className="sb-doc" href="#docs">
          <Icon.Code size={14} /> Documentation
          <Icon.Chevron size={12} className="sb-doc-chev" />
        </a>

        <div className="sb-usage">
          <div className="sb-usage-row">
            <span className="dim">{formatCu(cuUsed)} / {formatCu(cuLimit)} CUs</span>
            <span className="dim">{cuPct}%</span>
          </div>
          <div className="sb-usage-bar" aria-hidden>
            <div className="sb-usage-fill" style={{ width: `${cuPct}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
