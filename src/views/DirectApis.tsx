import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { EndpointDrawer } from '../components/EndpointDrawer';
import {
  Avatar, Spec, ViewToolbar, SectionHeader, SearchInput, Empty,
} from '../components/ui';
import type { DrawerSource } from '../components/EndpointDrawer';
import {
  directProviders,
  spotlightProviders,
  hyperliquidProviders,
  standardProviders,
  directEndpointCount,
} from '../data/catalog';
import type { DirectProvider } from '../data/catalog';

function toDrawerSource(provider: DirectProvider): DrawerSource {
  return {
    eyebrow: 'Direct API',
    surface: 'direct',
    title: provider.name,
    description: provider.blurb ?? provider.subtitle,
    icon: provider.icon,
    endpoints: provider.endpoints,
    totalCount: provider.endpointCount,
    categories: provider.categories,
    docsUrl: provider.docsUrl,
  };
}

type CardProps = {
  provider: DirectProvider;
  onOpen: (p: DirectProvider) => void;
  featured?: boolean;
};

/** Large card used in the spotlight and Hyperliquid rows. */
function FeatureCard({ provider, onOpen }: CardProps) {
  return (
    <button className="prov-feature marks-4" onClick={() => onOpen(provider)}>
      <div className="prov-feature-head">
        <Avatar src={provider.icon} name={provider.name} size="lg" />
        <div className="prov-feature-name">
          <span className="prov-feature-title">{provider.name}</span>
          <span className="prov-feature-sub dim">{provider.subtitle}</span>
        </div>
      </div>

      {provider.blurb && <p className="prov-feature-blurb muted">{provider.blurb}</p>}

      <Spec
        rows={[
          { label: 'Endpoints', value: provider.endpointCount },
          { label: 'Categories', value: provider.categories.length },
        ]}
      />

      <div className="prov-feature-cats">
        {provider.categories.slice(0, 3).map((c) => (
          <span key={c} className="offering-chip">{c}</span>
        ))}
        {provider.categories.length > 3 && (
          <span className="offering-chip">+{provider.categories.length - 3}</span>
        )}
      </div>

      <span className="prov-feature-cta mono">
        View endpoints <span className="arrow">→</span>
      </span>
    </button>
  );
}

/** Compact card used in the full provider list. */
function ProviderTile({ provider, onOpen }: CardProps) {
  return (
    <button className="prov-tile" onClick={() => onOpen(provider)}>
      <div className="prov-tile-head">
        <Avatar src={provider.icon} name={provider.name} size="lg" />
        <div className="prov-tile-name">
          <span className="prov-tile-title">{provider.name}</span>
          <span className="prov-tile-sub dim">{provider.subtitle}</span>
        </div>
        <Icon.Chevron size={14} className="prov-tile-chev" />
      </div>
      <div className="prov-tile-cats">
        {provider.categories.slice(0, 3).map((c) => (
          <span key={c} className="offering-chip">{c}</span>
        ))}
        {provider.categories.length > 3 && (
          <span className="offering-chip">+{provider.categories.length - 3}</span>
        )}
      </div>
      <div className="prov-tile-meta">
        <span className="mono">{provider.endpointCount} endpoints</span>
        <span className="dot" aria-hidden />
        <span className="mono">
          {provider.categories.length} {provider.categories.length === 1 ? 'category' : 'categories'}
        </span>
      </div>
    </button>
  );
}

export function DirectApis() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<DirectProvider | null>(null);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const results = useMemo(() => {
    if (!searching) return standardProviders;
    return directProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.categories.some((c) => c.toLowerCase().includes(q)),
    );
  }, [q, searching]);

  return (
    <div className="view">
      {!searching && (
        <>
          <section className="rise rise-1">
            <SectionHeader lead title="Spotlight" meta="Featured integrations" />
            <div className="prov-feature-grid two">
              {spotlightProviders.map((p) => (
                <FeatureCard key={p.id} provider={p} onOpen={setOpen} />
              ))}
            </div>
          </section>

          <section className="rise rise-2">
            <SectionHeader lead title="Best for Hyperliquid" meta={`${hyperliquidProviders.length} providers`} />
            <div className="prov-feature-grid three">
              {hyperliquidProviders.map((p) => (
                <FeatureCard key={p.id} provider={p} onOpen={setOpen} />
              ))}
            </div>
          </section>
        </>
      )}

      <ViewToolbar
        className="rise rise-3"
        title={searching ? 'Search results' : 'All providers'}
        count={
          searching
            ? `${results.length} of ${directProviders.length}`
            : `${directProviders.length} providers · ${directEndpointCount.toLocaleString()} endpoints`
        }
      >
        <SearchInput compact value={query} onChange={setQuery} placeholder="Search providers…" />
      </ViewToolbar>

      <section className="prov-direct-grid rise rise-4">
        {results.map((p) => (
          <ProviderTile key={p.id} provider={p} onOpen={setOpen} />
        ))}
        {results.length === 0 && <Empty>No providers match “{query}”.</Empty>}
      </section>

      <EndpointDrawer
        source={open ? toDrawerSource(open) : null}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}
