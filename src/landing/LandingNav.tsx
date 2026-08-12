import { nav } from './content/home';
import { Icon } from '../components/Icons';
import { Panel, Table, RowChevron } from '../components/ui';
import type { Theme } from '../theme';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
  /** True when the page opens on a dark hero the bar should sit over. */
  overlay?: boolean;
};

type MenuItem = {
  label: string;
  href: string;
  icon: keyof typeof Icon;
  blurb: string;
};

type NavLink =
  | { label: string; href: string; items?: undefined }
  | { label: string; href?: undefined; items: MenuItem[] };

const MENU_COLS = [
  { key: 'item', header: 'Item' },
  { key: 'desc', header: 'Desc' },
  { key: 'go' },
];

/** Grace so the pointer can travel trigger → panel across the gap. */
const HOVER_CLOSE_MS = 120;

function MenuTable({ items, onNavigate }: { items: MenuItem[]; onNavigate: () => void }) {
  return (
    <Table columns={MENU_COLS} ruled>
      {items.map((item, i) => {
        const Glyph = Icon[item.icon] ?? Icon.Grid;
        return (
          <tr
            key={item.label}
            className="row-click"
            onClick={() => {
              onNavigate();
              window.location.assign(item.href);
            }}
          >
            <td>
              <span className="lp-nav-dd-product">
                <span className="lp-nav-dd-idx mono dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Glyph size={16} className="lp-nav-dd-icon" />
                <span className="cell-strong">{item.label}</span>
              </span>
            </td>
            <td className="dim mono">{item.blurb}</td>
            <RowChevron />
          </tr>
        );
      })}
    </Table>
  );
}

/**
 * Sticky instrument strip, mono indices, live chip, registration marks.
 * Mega-menu Panels mount on the wrap (document theme), not under lp-invert.
 * Desktop menus are hover popovers; mobile drawer stays tap-to-expand.
 */
export function LandingNav({ theme, onToggleTheme, overlay }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [atTop, setAtTop] = useState(true);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseId = useId();

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = (label: string) => {
    clearCloseTimer();
    setActiveMenu(label);
  };

  const scheduleCloseMenu = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setActiveMenu(null), HOVER_CLOSE_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    if (!activeMenu || !wrapRef.current) {
      setPanelPos(null);
      return;
    }
    const trigger = triggerRefs.current[activeMenu];
    if (!trigger) {
      setPanelPos(null);
      return;
    }
    const wrap = wrapRef.current.getBoundingClientRect();
    const rect = trigger.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom - wrap.top + 10,
      left: Math.max(0, rect.left - wrap.left),
    });
  }, [activeMenu, drawerOpen]);

  useEffect(() => {
    if (!activeMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeMenu]);

  const onHero = Boolean(overlay) && atTop;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const links = nav.links as NavLink[];
  const openLink = links.find(
    (l): l is Extract<NavLink, { items: MenuItem[] }> => Boolean(l.items) && l.label === activeMenu,
  );

  const closeAll = () => {
    clearCloseTimer();
    setDrawerOpen(false);
    setActiveMenu(null);
  };

  /* The sheet covers the document, so the page behind it must stop scrolling
     and Escape has to be a way out. */
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  let linkIndex = 0;

  return (
    <div ref={wrapRef} className={`lp-nav-wrap ${onHero ? 'on-hero' : ''}`.trim()}>
      <nav className={`lp-nav marks-4 ${onHero ? 'lp-invert' : ''}`.trim()} aria-label="Main">
        <a className="lp-brand" href="/landing-page-home" aria-label="Uniblock home">
          <img src="/uniblock-logo.png" alt="" width={104} />
        </a>

        <div className={`lp-nav-links ${drawerOpen ? 'open' : ''}`.trim()}>
          {/* Sheet chrome, inert on desktop, where this row is the nav itself. */}
          <div className="lp-nav-sheet-bar" aria-hidden>
            <span className="lp-nav-sheet-cmd">
              uniblock <span className="lp-nav-sheet-dim">ls</span> ./routes
            </span>
            <span className="lp-caret" />
          </div>

          {links.map((link) => {
            const idx = String(++linkIndex).padStart(2, '0');

            if (!link.items) {
              return (
                <a
                  key={link.label}
                  className="lp-nav-link"
                  href={link.href}
                  onClick={closeAll}
                >
                  <span className="lp-nav-idx">{idx}</span>
                  <span className="lp-nav-label">{link.label}</span>
                </a>
              );
            }

            const menuId = `${baseId}-${link.label}`;
            const isOpen = activeMenu === link.label;

            return (
              <div
                key={link.label}
                className="lp-nav-dd-mobile"
                onMouseEnter={() => openMenu(link.label)}
                onMouseLeave={scheduleCloseMenu}
              >
                <button
                  ref={(node) => {
                    triggerRefs.current[link.label] = node;
                  }}
                  type="button"
                  className={`lp-nav-link lp-nav-dd-trigger ${isOpen ? 'open' : ''}`.trim()}
                  aria-expanded={isOpen}
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onFocus={() => openMenu(link.label)}
                  onBlur={(e) => {
                    const next = e.relatedTarget as Node | null;
                    if (panelRef.current?.contains(next)) return;
                    scheduleCloseMenu();
                  }}
                  onClick={() => {
                    if (drawerOpen) {
                      setActiveMenu((v) => (v === link.label ? null : link.label));
                    }
                  }}
                >
                  <span className="lp-nav-idx">{idx}</span>
                  <span className="lp-nav-label">{link.label}</span>
                  <Icon.ChevronDown size={11} className="lp-nav-dd-caret" />
                </button>
                {isOpen && drawerOpen && (
                  <Panel id={menuId} className="lp-nav-dd-panel-mobile" flush marks={4}>
                    <MenuTable items={link.items} onNavigate={closeAll} />
                  </Panel>
                )}
              </div>
            );
          })}

          <div className="lp-nav-sheet-foot">
            <button
              className="lp-nav-theme lp-nav-theme-sheet"
              onClick={onToggleTheme}
              aria-label={`Switch to ${nextTheme} theme`}
            >
              <span className="lp-nav-theme-k">theme</span>
              <span className="lp-nav-theme-v">{theme}</span>
            </button>
          </div>
        </div>

        <div className="lp-nav-actions">
          <button
            className="lp-nav-theme"
            onClick={onToggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
          >
            <span className="lp-nav-theme-k">theme</span>
            <span className="lp-nav-theme-v">{theme}</span>
          </button>

          <button className="btn primary lp-nav-cta">
            <Icon.Key size={14} />
            {nav.cta}
          </button>

          <button
            className="btn dark icon-only lp-nav-toggle"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <Icon.X size={16} /> : <Icon.Menu size={17} />}
          </button>
        </div>
      </nav>

      {activeMenu && !drawerOpen && openLink && panelPos && (
        <div
          ref={panelRef}
          className="lp-nav-dd-anchor"
          style={{ top: panelPos.top, left: panelPos.left }}
          onMouseEnter={() => openMenu(activeMenu)}
          onMouseLeave={scheduleCloseMenu}
        >
          <div className="lp-nav-dd-bridge" aria-hidden />
          <Panel
            id={`${baseId}-${activeMenu}`}
            className="lp-nav-dd-panel"
            flush
            marks={4}
          >
            <header className="lp-nav-dd-head">
              <span className="lp-nav-dd-head-k">{activeMenu.toLowerCase()}</span>
              <span className="lp-nav-dd-head-v">{openLink.items.length} entries</span>
            </header>
            <MenuTable items={openLink.items} onNavigate={closeAll} />
          </Panel>
        </div>
      )}
    </div>
  );
}
