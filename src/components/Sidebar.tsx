import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { projects } from '../data/mock';
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

const projectNav: NavEntry[] = [
  { id: 'overview',  label: 'Overview',   icon: 'Grid' },
  { id: 'analytics', label: 'Analytics',  icon: 'Chart' },
  {
    key: 'apis',
    label: 'APIs',
    icon: 'Code',
    children: [
      { id: 'apis-unified', label: 'Unified' },
      { id: 'apis-direct',  label: 'Direct' },
      { id: 'apis-all',     label: 'All', badge: { text: '8', tone: 'green' } },
    ],
  },
  { id: 'json-rpc',   label: 'JSON-RPC',   icon: 'Tx' },
  { id: 'webhooks',   label: 'Webhooks',   icon: 'Webhook', badge: { text: '2', tone: 'orange' } },
  { id: 'api-tester', label: 'API Tester', icon: 'Beaker' },
];

const settingsNav: NavLeaf[] = [
  { id: 'settings-project', label: 'Project', icon: 'Folder' },
  { id: 'settings-team',    label: 'Team',    icon: 'Users' },
  { id: 'settings-billing', label: 'Billing', icon: 'Card' },
];

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
      {I && <I size={16} />}
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
        <I size={16} />
        <span className="nav-label">{group.label}</span>
        {group.badge && <NavBadge badge={group.badge} />}
        <Icon.ChevronDown size={14} className={`nav-caret ${open ? 'open' : ''}`} />
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
          <Icon.ChevronDown size={14} />
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
              <Icon.Plus size={14} />
              <span>New project…</span>
            </button>
          </div>
        )}
      </div>

      <nav className="sb-nav" aria-label="Project">
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
            {qs.done === qs.total ? 'All set — explore the docs' : 'Make your first API call'}
          </span>
        </button>

        <div className="sb-section-label">Project</div>
        {projectNav.map((entry) =>
          isGroup(entry) ? (
            <NavGroupItem key={entry.key} group={entry} view={view} onNavigate={onNavigate} />
          ) : (
            <NavLeafItem key={entry.id} item={entry} view={view} onNavigate={onNavigate} />
          ),
        )}

        <div className="sb-section-label">Settings</div>
        {settingsNav.map((item) => (
          <NavLeafItem key={item.id} item={item} view={view} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="sb-bottom">
        <a className="sb-doc" href="#docs">
          <Icon.Code size={13} /> Documentation
          <Icon.Chevron size={12} className="sb-doc-chev" />
        </a>

        <div className="sb-plan">
          <div className="sb-plan-row">
            <span className="sb-plan-name">Startup Plan</span>
            <span className="badge new">FREE</span>
          </div>
          <button className="btn primary sb-upgrade">Upgrade</button>
          <div className="sb-usage">
            <div className="sb-usage-row">
              <span className="dim">40 / 40M CUs</span>
              <span className="dim">0%</span>
            </div>
            <div className="sb-usage-bar" aria-hidden>
              <div className="sb-usage-fill" style={{ width: '2%' }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
