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

type ProductItem = {
  label: string;
  href: string;
  icon: keyof typeof Icon;
  blurb: string;
};

type NavLink =
  | { label: string; href: string; items?: undefined }
  | { label: string; href?: undefined; items: ProductItem[] };

const PRODUCT_COLS = [
  { key: 'product', header: 'Product' },
  { key: 'about', header: 'About' },
  { key: 'go' },
];

function ProductsTable({
  items,
  onNavigate,
}: {
  items: ProductItem[];
  onNavigate: () => void;
}) {
  return (
    <Table columns={PRODUCT_COLS} ruled>
      {items.map((item) => {
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
                <Glyph size={16} className="lp-nav-dd-icon" />
                <span className="cell-strong">{item.label}</span>
              </span>
            </td>
            <td className="dim">{item.blurb}</td>
            <RowChevron />
          </tr>
        );
      })}
    </Table>
  );
}

/**
 * Sticky strip on the page rails. Invert only the bar over a dark hero —
 * the Products Panel mounts on the wrap (document theme tokens), not under
 * lp-invert, so dark mode keeps elevated dark.
 */
export function LandingNav({ theme, onToggleTheme, overlay }: Props) {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const productsId = useId();

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    if (!productsOpen || !wrapRef.current || !triggerRef.current) {
      setPanelPos(null);
      return;
    }
    const wrap = wrapRef.current.getBoundingClientRect();
    const trigger = triggerRef.current.getBoundingClientRect();
    setPanelPos({
      top: trigger.bottom - wrap.top + 10,
      left: Math.max(0, trigger.left - wrap.left),
    });
  }, [productsOpen, open]);

  useEffect(() => {
    if (!productsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProductsOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setProductsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [productsOpen]);

  const onHero = Boolean(overlay) && atTop;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const links = nav.links as NavLink[];
  const products = links.find((l): l is Extract<NavLink, { items: ProductItem[] }> => Boolean(l.items));

  const closeAll = () => {
    setOpen(false);
    setProductsOpen(false);
  };

  return (
    <div ref={wrapRef} className={`lp-nav-wrap ${onHero ? 'on-hero' : ''}`.trim()}>
      <nav className={`lp-nav ${onHero ? 'lp-invert' : ''}`.trim()} aria-label="Main">
        <a className="lp-brand" href="/landing-page-home" aria-label="Uniblock home">
          <img src="/uniblock-logo.png" alt="" width={104} />
        </a>

        <div className={`lp-nav-links ${open ? 'open' : ''}`.trim()}>
          {links.map((link) => {
            if (!link.items) {
              return (
                <a
                  key={link.label}
                  className="lp-nav-link"
                  href={link.href}
                  onClick={closeAll}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <div key={link.label} className="lp-nav-dd-mobile">
                <button
                  ref={triggerRef}
                  type="button"
                  className={`lp-nav-link lp-nav-dd-trigger ${productsOpen ? 'open' : ''}`.trim()}
                  aria-expanded={productsOpen}
                  aria-controls={productsId}
                  onClick={() => setProductsOpen((v) => !v)}
                >
                  {link.label}
                  <Icon.ChevronDown size={12} className="lp-nav-dd-caret" />
                </button>
                {productsOpen && open && (
                  <Panel id={productsId} className="lp-nav-dd-panel-mobile" flush marks={4}>
                    <ProductsTable items={link.items} onNavigate={closeAll} />
                  </Panel>
                )}
              </div>
            );
          })}
        </div>
        {open && <div className="lp-nav-scrim" onClick={closeAll} />}

        <div className="lp-nav-actions">
          <button
            className="btn dark"
            onClick={onToggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
          >
            {theme === 'dark' ? <Icon.Moon size={14} /> : <Icon.Sun size={14} />}
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>

          <button className="btn primary lp-nav-cta">{nav.cta}</button>

          <button
            className="btn dark lp-nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      {/* Desktop: Panel on the wrap so it inherits document theme, not lp-invert. */}
      {productsOpen && !open && products && panelPos && (
        <div
          ref={panelRef}
          className="lp-nav-dd-anchor"
          style={{ top: panelPos.top, left: panelPos.left }}
        >
          <Panel id={productsId} className="lp-nav-dd-panel" flush marks={4}>
            <ProductsTable items={products.items} onNavigate={closeAll} />
          </Panel>
        </div>
      )}
    </div>
  );
}
