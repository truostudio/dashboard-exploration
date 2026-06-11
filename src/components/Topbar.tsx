import { Icon } from './Icons';

type Props = {
  title: string;
  subtitle?: string;
  onNewProject: () => void;
  primaryAction?: { label: string; onClick: () => void };
};

export function Topbar({
  title,
  subtitle,
  onNewProject,
  primaryAction,
}: Props) {
  return (
    <header className="topbar">
      <div className="tb-left">
        <h1 className="tb-title">{title}</h1>
        {subtitle && <p className="tb-subtitle">{subtitle}</p>}
      </div>

      <div className="tb-actions">
        <div className="tb-search">
          <Icon.Search size={14} />
          <input
            type="search"
            placeholder="Search endpoints, chains, docs…"
            aria-label="Search"
          />
          <span className="kbd">⌘K</span>
        </div>

        <button className="btn ghost icon-only" aria-label="Notifications">
          <Icon.Bell size={15} />
        </button>

        <button className="btn" onClick={onNewProject}>
          <Icon.Plus size={14} /> New project
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
