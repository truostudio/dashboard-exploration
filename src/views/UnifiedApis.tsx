import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { EndpointDrawer } from '../components/EndpointDrawer';
import { Segmented } from '../components/Segmented';
import { Spec, ViewToolbar, SearchInput, AvatarStack, MethodBadge, Empty } from '../components/ui';
import type { DrawerSource } from '../components/EndpointDrawer';
import { chains } from '../data/mock';
import { unifiedCategories, unifiedEndpointCount, platformStats } from '../data/catalog';

type Sort = 'trending' | 'alpha';

export function UnifiedApis() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('trending');
  const [active, setActive] = useState<string>('all');
  const [open, setOpen] = useState<DrawerSource | null>(null);

  const query = search.trim().toLowerCase();

  const categories = useMemo(() => {
    let list = active === 'all' ? unifiedCategories : unifiedCategories.filter((c) => c.id === active);

    // Searching narrows each category to its matching endpoints, and drops
    // categories that no longer have any.
    if (query) {
      list = list
        .map((category) => ({
          ...category,
          endpoints: category.endpoints.filter(
            (e) =>
              e.path.toLowerCase().includes(query) ||
              e.title.toLowerCase().includes(query) ||
              e.category.toLowerCase().includes(query),
          ),
        }))
        .filter((category) => category.endpoints.length > 0);
    }

    if (sort === 'alpha') list = [...list].sort((a, b) => a.label.localeCompare(b.label));
    return list;
  }, [active, query, sort]);

  const matches = categories.reduce((n, c) => n + c.endpoints.length, 0);

  return (
    <div className="view">
      <ViewToolbar
        className="rise rise-1"
        title="Endpoint categories"
        count={query ? `${matches} matching` : `${unifiedEndpointCount} endpoints`}
      >
        <SearchInput compact value={search} onChange={setSearch} placeholder="Search endpoints…" />
        <button className="btn"><Icon.Defi size={14} /> Filter chains</button>
        <Segmented
          label="Sort order"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'trending', label: 'Trending' },
            { value: 'alpha', label: 'Alphabetical' },
          ]}
        />
      </ViewToolbar>

      <div className="chip-strip rise rise-2">
        <button className={`chip ${active === 'all' ? 'on' : ''}`} onClick={() => setActive('all')}>All</button>
        {unifiedCategories.map((category) => (
          <button
            key={category.id}
            className={`chip ${active === category.id ? 'on' : ''}`}
            onClick={() => setActive(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <section className="unified-grid rise rise-3">
        {categories.map((category) => {
          const shown = chains.slice(0, 4);
          const methods = [...new Set(category.endpoints.map((e) => e.method))];
          return (
            <button
              key={category.id}
              className="usum-card marks-4"
              onClick={() =>
                setOpen({
                  eyebrow: 'Unified API',
                  surface: 'unified',
                  title: category.label,
                  description: category.description,
                  endpoints: unifiedCategories.find((c) => c.id === category.id)!.endpoints,
                  docsUrl: 'https://docs.uniblock.dev/reference/unified-api/overview-unified-apis',
                })
              }
            >
              <div className="usum-head">
                <span className="usum-path">{category.label}</span>
                <div className="usum-methods">
                  {methods.map((m) => <MethodBadge key={m} method={m} />)}
                </div>
              </div>
              <span className="usum-desc dim">{category.description}</span>

              <Spec
                rows={[
                  { label: 'Endpoints', value: category.endpoints.length },
                  { label: 'Chains', value: platformStats.chains },
                ]}
              />

              <div className="usum-foot">
                <AvatarStack items={shown} />
                <span className="dim mono usum-prov">
                  View endpoints <span className="arrow">→</span>
                </span>
              </div>
            </button>
          );
        })}
        {categories.length === 0 && <Empty>No endpoints match “{search}”.</Empty>}
      </section>

      <EndpointDrawer source={open} onClose={() => setOpen(null)} />
    </div>
  );
}
