import { Icon } from './Icons';

import type { Theme } from '../theme';

type Props = {
  section?: string;
  title: string;
  subtitle?: string;
  onNewProject: () => void;
  onMenu?: () => void;
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

      <div className="tb-actions">
        {/* Deliberately a button wearing a field's clothes. It used to be a real
            input whose value went nowhere, which meant typing here silently did
            nothing — worse than no field at all. Now it opens the palette that
            actually searches, and the ⌘K hint is true. */}
        <button className="tb-searchbtn" onClick={onSearch} aria-label="Search endpoints and pages">
          <Icon.Search size={15} className="tb-searchbtn-icon" />
          <span className="tb-searchbtn-text">Search endpoints, chains, docs…</span>
          <span className="kbd">⌘K</span>
        </button>

        <button
          className="btn ghost icon-only theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${nextTheme} theme`}
          title={`Switch to ${nextTheme} theme`}
        >
          <Icon.Sun size={16} className="theme-icon sun" />
          <Icon.Moon size={15} className="theme-icon moon" />
        </button>

        <button className="btn ghost icon-only" aria-label="Notifications">
          <Icon.Bell size={15} />
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
