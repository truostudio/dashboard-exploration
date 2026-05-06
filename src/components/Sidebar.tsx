import { useState } from 'react';
import { Icon } from './Icons';
import { projects } from '../data/mock';
import type { ViewId } from '../App';

type NavItem = {
  id: ViewId;
  label: string;
  icon: keyof typeof Icon;
};

const projectNav: NavItem[] = [
  { id: 'overview',   label: 'Overview',     icon: 'Grid' },
  { id: 'endpoints',  label: 'Endpoints',    icon: 'Code' },
  { id: 'api-tester', label: 'API Tester',   icon: 'Beaker' },
  { id: 'webhooks',   label: 'Webhooks',     icon: 'Webhook' },
  { id: 'logs',       label: 'Logs',         icon: 'Chart' },
];

const settingsNav: NavItem[] = [
  { id: 'settings-project', label: 'Project',  icon: 'Folder' },
  { id: 'settings-team',    label: 'Team',     icon: 'Users' },
  { id: 'settings-keys',    label: 'API Keys', icon: 'Key' },
  { id: 'settings-billing', label: 'Billing',  icon: 'Card' },
];

type Props = {
  view: ViewId;
  onNavigate: (id: ViewId) => void;
  onNewProject: () => void;
  quickstartProgress: { done: number; total: number };
};

export function Sidebar({ view, onNavigate, onNewProject, quickstartProgress }: Props) {
  const [project, setProject] = useState(projects[0].id);
  const [open, setOpen] = useState(false);
  const [keyShown, setKeyShown] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = 'ub_demo_8f4c2a91b73e5a90c1f6d8e2b5a7c3d9';
  const masked = `${apiKey.slice(0, 8)}${'•'.repeat(8)}`;

  const qs = quickstartProgress;
  const qsPct = Math.round((qs.done / qs.total) * 100);
  const qsActive = view === 'quickstart';

  return (
    <aside className="sidebar">
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
        {projectNav.map((item) => {
          const I = Icon[item.icon];
          return (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <I size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="sb-section-label">Settings</div>
        {settingsNav.map((item) => {
          const I = Icon[item.icon];
          return (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <I size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sb-bottom">
        <a className="sb-doc" href="#docs">
          <Icon.Code size={13} /> Documentation
          <Icon.Chevron size={12} className="sb-doc-chev" />
        </a>

        <div className="sb-block">
          <div className="sb-block-label">API Key</div>
          <div className="sb-key">
            <span className="mono sb-key-text">
              {keyShown ? apiKey : masked}
            </span>
            <button
              className="sb-key-btn"
              aria-label={keyShown ? 'Hide API key' : 'Show API key'}
              onClick={() => setKeyShown((v) => !v)}
            >
              <Icon.Eye size={13} />
            </button>
            <button
              className="sb-key-btn"
              aria-label="Copy API key"
              onClick={() => {
                navigator.clipboard?.writeText(apiKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? <Icon.Check size={13} /> : <Icon.Copy size={13} />}
            </button>
          </div>
        </div>

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

        <div className="sb-status">
          <span className="sb-status-dot" aria-hidden />
          <span className="dim">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
