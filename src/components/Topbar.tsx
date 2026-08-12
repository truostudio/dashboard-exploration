import { Icon } from './Icons';
import { Notifications } from './Notifications';

import type { Theme } from '../theme';
import type { ViewId } from '../App';

type Props = {
  section?: string;
  title: string;
  subtitle?: string;
  onNewProject: () => void;
  onMenu?: () => void;
  /** Lets a notification row take you where it is about. */
  onNavigate: (id: ViewId) => void;
  /** Opens the command palette. The field is a button, not an input. */
  onSearch?: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  primaryAction?: { label: string; onClick: () => void };
};

export function Topbar({
  section,
  title,
  subtitle,
  onNewProject,
  onMenu,
  onNavigate,
  onSearch,
  theme,
  onToggleTheme,
  primaryAction,
}: Props) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <header className="topbar">
      <button className="tb-menu btn ghost icon-only" aria-label="Open menu" onClick={onMenu}>
        <Icon.Menu size={18} />
      </button>

      <div className="tb-left">
        {section && (
          <nav className="tb-crumb" aria-label="Breadcrumb">
            <span>{section}</span>
            <span className="tb-crumb-sep" aria-hidden>
              /
            </span>
            <span className="tb-crumb-now">{title}</span>
          </nav>
        )}
        <h1 className="tb-title">{title}</h1>
        {subtitle && <p className="tb-subtitle">{subtitle}</p>}
      </div>

      {/* Ambient controls first, then the things you act with: theme and the
          bell are settings you glance at, so they lead; search and the primary
          action sit closest to the edge you reach for. */}
      <div className="tb-actions">
        <button
          className="btn ghost icon-only theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${nextTheme} theme`}
          title={`Switch to ${nextTheme} theme`}
        >
          <Icon.Sun size={16} className="theme-icon sun" />
          <Icon.Moon size={15} className="theme-icon moon" />
        </button>

        <Notifications onNavigate={onNavigate} />

        {/* Deliberately a button wearing a field's clothes. It used to be a real
            input whose value went nowhere, which meant typing here silently did
            nothing, worse than no field at all. Now it opens the palette that
            actually searches, and the ⌘K hint is true. */}
        <button className="tb-searchbtn" onClick={onSearch} aria-label="Search endpoints and pages">
          <Icon.Search size={15} className="tb-searchbtn-icon" />
          <span className="tb-searchbtn-text">Search endpoints, chains, docs…</span>
          <span className="kbd">⌘K</span>
        </button>

        <button className="btn tb-new-project" onClick={onNewProject}>
          <Icon.Plus size={14} /> <span className="tb-new-label">New project</span>
        </button>

        {primaryAction && (
          <button className="btn primary" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </button>
        )}
      </div>
    </header>
  );
}
