import { useState } from 'react';
import { Icon } from './Icons';
import { SearchInput } from './ui';
import type { Theme } from '../theme';

type Props = {
  section?: string;
  title: string;
  subtitle?: string;
  onNewProject: () => void;
  onMenu?: () => void;
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
  theme,
  onToggleTheme,
  primaryAction,
}: Props) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const [query, setQuery] = useState('');
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
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search endpoints, chains, docs…"
          label="Search"
          hint={<span className="kbd">⌘K</span>}
        />

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
