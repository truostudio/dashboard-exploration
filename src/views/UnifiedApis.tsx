import { useMemo, useState } from 'react';
import { EndpointDrawer } from '../components/EndpointDrawer';
import { Segmented } from '../components/Segmented';
import {
  Spec, ViewToolbar, SearchInput, AvatarStack, MethodBadge, Empty, FilterPopover, FilterGroup,
} from '../components/ui';
import type { DrawerSource } from '../components/EndpointDrawer';
import { chains } from '../data/mock';
import { unifiedCategories, unifiedEndpointCount, platformStats } from '../data/catalog';
import { endpointsForChain } from '../data/chainCoverage';

type Sort = 'trending' | 'alpha';

export function UnifiedApis() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('trending');
  const [active, setActive] = useState<string>('all');
  const [chainFilter, setChainFilter] = useState<string[]>([]);
  const [open, setOpen] = useState<DrawerSource | null>(null);

  const query = search.trim().toLowerCase();

  /**
   * Which categories the chosen chains can actually reach.
   *
   * Derived from `endpointsForChain`, the same function the chain directory
   * uses, so a category listed under Toncoin there cannot be missing here. The
   * Unified surface is chain-agnostic for most of its categories and emphatically
   * not for the rest. TON HTTP exists on Toncoin and nowhere else, which is
   * exactly what makes this filter worth having rather than decorative.
   *
   * Union, not intersection: picking two chains asks "what can I call on either",
   * which is what every other filter in the app means by a multi-select.
   */
  const reachable = useMemo(() => {
    if (chainFilter.length === 0) return null;
    const ids = new Set<string>();
    for (const id of chainFilter) {
      const chain = chains.find((c) => c.id === id);
      if (!chain) continue;
      for (const c of endpointsForChain(chain.id, chain.category, chain.chainId).categories) {
        ids.add(c.id);
      }
    }
    return ids;
  }, [chainFilter]);

  const categories = useMemo(() => {
    let list = active === 'all' ? unifiedCategories : unifiedCategories.filter((c) => c.id === active);

    if (reachable) list = list.filter((c) => reachable.has(c.id));

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
  }, [active, query, sort, reachable]);

  const matches = categories.reduce((n, c) => n + c.endpoints.length, 0);

  return (
    <div className="view">
      <ViewToolbar
        className="rise rise-1"
        title="Endpoint categories"
        count={query ? `${matches} matching` : `${unifiedEndpointCount} endpoints`}
      >
        <SearchInput compact value={search} onChange={setSearch} placeholder="Search endpoints…" />
        <FilterPopover
          label="Chains"
          activeCount={chainFilter.length}
          onClear={() => setChainFilter([])}
        >
          <FilterGroup label="Chain">
            {chains.map((chain) => {
              const on = chainFilter.includes(chain.id);
              return (
                <button
                  key={chain.id}
                  className={`chip ${on ? 'on' : ''}`.trim()}
                  onClick={() =>
                    setChainFilter((prev) =>
                      on ? prev.filter((c) => c !== chain.id) : [...prev, chain.id],
                    )
                  }
                >
                  <img className="chip-mark" src={chain.icon} alt="" />
                  {chain.name}
                </button>
              );
            })}
          </FilterGroup>
        </FilterPopover>
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

      {/* One control, not a row of loose buttons: these are mutually exclusive
          views of the same list, which is what `Segmented` is for. */}
      <Segmented
        className="rise rise-2 cat-strip"
        label="Endpoint category"
        value={active}
        onChange={setActive}
        options={[
          { value: 'all', label: 'All' },
          ...unifiedCategories.map((category) => ({ value: category.id, label: category.label })),
        ]}
      />

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
