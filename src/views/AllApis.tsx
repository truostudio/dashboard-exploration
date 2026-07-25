import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { EndpointDrawer } from '../components/EndpointDrawer';
import { Segmented } from '../components/Segmented';
import {
  Panel, Table, TableFoot, RowChevron, ViewToolbar, SearchInput, Badge, Avatar, Empty,
  FilterPopover, FilterGroup,
} from '../components/ui';
import type { DrawerSource } from '../components/EndpointDrawer';
import { unifiedCategories, directProviders } from '../data/catalog';
import type { ApiEndpoint } from '../data/catalog';

type Surface = 'all' | 'unified' | 'direct';

/**
 * One row per category (unified) or per provider (direct). The row is the
 * thing you open, and the drawer inside it lists the endpoints.
 */
type Row = {
  key: string;
  name: string;
  surface: 'unified' | 'direct';
  count: number;
  categories: string[];
  methods: string[];
  source: DrawerSource;
};

const unifiedRows: Row[] = unifiedCategories.map((category) => ({
  key: `unified-${category.id}`,
  name: category.label,
  surface: 'unified',
  count: category.endpoints.length,
  categories: [category.label],
  methods: [...new Set(category.endpoints.map((e) => e.method))],
  source: {
    eyebrow: 'Unified API',
    surface: 'unified',
    title: category.label,
    description: category.description,
    endpoints: category.endpoints,
    docsUrl: 'https://docs.uniblock.dev/reference/unified-api/overview-unified-apis',
  },
}));

const directRows: Row[] = directProviders.map((provider) => ({
  key: `direct-${provider.id}`,
  name: provider.name,
  surface: 'direct',
  count: provider.endpointCount,
  categories: provider.categories,
  methods: [...new Set(provider.endpoints.map((e: ApiEndpoint) => e.method))],
  source: {
    eyebrow: 'Direct API',
    surface: 'direct',
    title: provider.name,
    description: provider.blurb ?? provider.subtitle,
    icon: provider.icon,
    endpoints: provider.endpoints,
    totalCount: provider.endpointCount,
    categories: provider.categories,
    docsUrl: provider.docsUrl,
  },
}));

const allRows: Row[] = [...unifiedRows, ...directRows];

const ALL_CATEGORIES = [...new Set(allRows.flatMap((r) => r.categories))].sort();
const METHOD_ORDER = ['GET', 'POST', 'WS'] as const;
const ALL_METHODS = METHOD_ORDER.filter((m) => allRows.some((r) => r.methods.includes(m)));

const PAGE = 12;

export function AllApis() {
  const [surface, setSurface] = useState<Surface>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<DrawerSource | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [methodFilter, setMethodFilter] = useState<string[]>([]);

  const toggleCategory = (c: string) => {
    setCategoryFilter((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    setPage(1);
  };
  const toggleMethod = (m: string) => {
    setMethodFilter((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
    setPage(1);
  };
  const clearFilters = () => {
    setCategoryFilter([]);
    setMethodFilter([]);
    setPage(1);
  };

  const rows = useMemo(() => {
    let out = allRows;
    if (surface !== 'all') out = out.filter((r) => r.surface === surface);
    if (categoryFilter.length) out = out.filter((r) => r.categories.some((c) => categoryFilter.includes(c)));
    if (methodFilter.length) out = out.filter((r) => r.methods.some((m) => methodFilter.includes(m)));
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.categories.some((c) => c.toLowerCase().includes(q)) ||
          r.source.endpoints.some(
            (e) => e.path.toLowerCase().includes(q) || e.title.toLowerCase().includes(q),
          ),
      );
    }
    return out;
  }, [surface, search, categoryFilter, methodFilter]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PAGE, current * PAGE);
  const totalEndpoints = rows.reduce((n, r) => n + r.count, 0);

  return (
    <div className="view">
      <ViewToolbar
        className="rise rise-1"
        lead={
          <Segmented
            label="API surface"
            value={surface}
            onChange={(s) => { setSurface(s); setPage(1); }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'unified', label: 'Unified' },
              { value: 'direct', label: 'Direct' },
            ]}
          />
        }
      >
        <SearchInput
          compact
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search endpoints, categories, providers…"
        />
        <FilterPopover activeCount={categoryFilter.length + methodFilter.length} onClear={clearFilters}>
          <FilterGroup label="Category">
            {ALL_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${categoryFilter.includes(c) ? 'on' : ''}`}
                onClick={() => toggleCategory(c)}
              >
                {c}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup label="Method">
            {ALL_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                className={`chip ${methodFilter.includes(m) ? 'on' : ''}`}
                onClick={() => toggleMethod(m)}
              >
                {m}
              </button>
            ))}
          </FilterGroup>
        </FilterPopover>
      </ViewToolbar>

      <Panel marks flush className="rise rise-2">
        <Table
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'surface', header: 'Surface' },
            { key: 'categories', header: 'Categories' },
            { key: 'count', header: 'Endpoints', align: 'right' },
            { key: 'go' },
          ]}
        >
          {shown.map((row) => (
            <tr key={row.key} className="row-click" onClick={() => setOpen(row.source)}>
              <td>
                <span className="member-cell">
                  {row.source.icon && <Avatar src={row.source.icon} name={row.name} size="sm" />}
                  <span className="cell-strong">{row.name}</span>
                </span>
              </td>
              <td>
                {row.surface === 'direct' ? (
                  <Badge><Icon.Send size={11} /> Direct</Badge>
                ) : (
                  <Badge tone="new"><Icon.Defi size={11} /> Unified</Badge>
                )}
              </td>
              <td className="dim">
                <span className="cat-inline">
                  {row.categories.slice(0, 3).join(' · ')}
                  {row.categories.length > 3 && ` +${row.categories.length - 3}`}
                </span>
              </td>
              <td className="num mono">{row.count}</td>
              <RowChevron />
            </tr>
          ))}
          {shown.length === 0 && (
            <tr>
              <td colSpan={5}>
                <Empty bare>
                  {search ? `No results match “${search}”.` : 'No results match your filters.'}
                </Empty>
              </td>
            </tr>
          )}
        </Table>
        <TableFoot
          page={current}
          pages={pages}
          onChange={setPage}
          summary={`${rows.length} groups · ${totalEndpoints.toLocaleString()} endpoints`}
        />
      </Panel>

      <EndpointDrawer source={open} onClose={() => setOpen(null)} />
    </div>
  );
}
