import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { Segmented } from '../components/Segmented';
import {
  Panel, Table, ViewToolbar, SectionHeader, SearchInput, Avatar, Empty, useCopy,
  FilterPopover, FilterGroup,
} from '../components/ui';
import { rpcGroups, rpcNetworkCount } from '../data/mock';
import type { RpcNetwork } from '../data/mock';

const HTTP = 'https://api.uniblock.dev/uni/v1/json-rpc';
const WSS = 'wss://api.uniblock.dev/uni/v1/json-rpc';

const KIND_LABEL: Record<RpcNetwork['kind'], string> = { mainnet: 'Mainnet', testnet: 'Testnet' };
const ALL_PROVIDERS = [...new Set(rpcGroups.flatMap((g) => g.networks.flatMap((n) => n.wssProviders.map((p) => p.name))))].sort();

export function JsonRpc() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'trending' | 'az'>('trending');
  const [ep, setEp] = useState<Record<string, 'https' | 'wss'>>({});
  const [wssProv, setWssProv] = useState<Record<string, string>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<RpcNetwork['kind'][]>([]);
  const [providerFilter, setProviderFilter] = useState<string[]>([]);
  const { copy, isCopied } = useCopy();

  const toggleKind = (k: RpcNetwork['kind']) => {
    setKindFilter((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };
  const toggleProvider = (p: string) => {
    setProviderFilter((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };
  const clearFilters = () => {
    setKindFilter([]);
    setProviderFilter([]);
  };

  const groups = useMemo(() => {
    const q = search.toLowerCase();
    let gs = rpcGroups
      .map((g) => ({
        ...g,
        networks: g.networks.filter((n) => {
          if (!(!q || n.name.toLowerCase().includes(q) || n.chainId.includes(q) || g.name.toLowerCase().includes(q))) return false;
          if (kindFilter.length && !kindFilter.includes(n.kind)) return false;
          if (providerFilter.length && !n.wssProviders.some((p) => providerFilter.includes(p.name))) return false;
          return true;
        }),
      }))
      .filter((g) => g.networks.length);
    if (sort === 'az') gs = [...gs].sort((a, b) => a.name.localeCompare(b.name));
    return gs;
  }, [search, sort, kindFilter, providerFilter]);

  return (
    <div className="view">
      <p className="dim rise rise-1 prose">
        Each chain groups its mainnet and related networks. Switch HTTPS or WebSockets to view the matching URL,
        and open a row for RPC tools and supported methods. WebSocket routing needs a provider selected before
        the URL can be copied.
      </p>

      <ViewToolbar
        className="rise rise-2"
        lead={
          <SearchInput
            grow
            value={search}
            onChange={setSearch}
            placeholder="Search networks by name or chain ID…"
          />
        }
      >
        <FilterPopover activeCount={kindFilter.length + providerFilter.length} onClear={clearFilters}>
          <FilterGroup label="Network">
            {(Object.keys(KIND_LABEL) as RpcNetwork['kind'][]).map((k) => (
              <button
                key={k}
                type="button"
                className={`chip ${kindFilter.includes(k) ? 'on' : ''}`}
                onClick={() => toggleKind(k)}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup label="WebSocket provider">
            {ALL_PROVIDERS.map((p) => (
              <button
                key={p}
                type="button"
                className={`chip ${providerFilter.includes(p) ? 'on' : ''}`}
                onClick={() => toggleProvider(p)}
              >
                {p}
              </button>
            ))}
          </FilterGroup>
        </FilterPopover>
        <Segmented
          label="Sort order"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'trending', label: 'Trending' },
            { value: 'az', label: 'A–Z' },
          ]}
        />
      </ViewToolbar>

      <div className="rise rise-3">
        <SectionHeader
          title={sort === 'az' ? 'All networks' : 'Popular networks'}
          meta={`${rpcNetworkCount} networks`}
        />
      </div>

      {groups.length === 0 && <Empty>No networks match your filters.</Empty>}

      {groups.map((g) => {
        const type = ep[g.id] ?? 'https';
        const wss = type === 'wss';
        const base = wss ? WSS : HTTP;
        return (
          <Panel key={g.id} className="rpc-group rise rise-3">
            <header className="rpc-group-head">
              <img className="rpc-group-icon" src={g.icon} alt="" />
              <h2 className="rpc-group-name">{g.name}</h2>
              <div className="endpoint-toggle">
                <span className="dim endpoint-label">Endpoint type</span>
                <Segmented
                  label={`${g.name} endpoint type`}
                  value={type}
                  onChange={(next) => setEp((s) => ({ ...s, [g.id]: next }))}
                  options={[
                    { value: 'https', label: 'HTTPS' },
                    { value: 'wss', label: 'WebSockets' },
                  ]}
                />
              </div>
            </header>

            <Table
              columns={[
                { key: 'network', header: 'Network' },
                ...(wss ? [{ key: 'provider', header: 'Provider' }] : []),
                { key: 'url', header: wss ? 'WebSocket URL' : 'HTTPS URL' },
                { key: 'last', header: 'Last request' },
              ]}
            >
                  {g.networks.map((n) => {
                    const rowKey = `${g.id}-${n.chainId}`;
                    const provider = wssProv[rowKey];
                    const url = wss
                      ? provider
                        ? `${base}?chainId=${n.chainId}&provider=${provider}`
                        : `${base}?chainId=${n.chainId}`
                      : `${base}?chainId=${n.chainId}`;
                    const sel = n.wssProviders.find((p) => p.name === provider);
                    return (
                      <tr key={n.chainId}>
                        <td>
                          <span className="member-cell">
                            <Avatar src={g.icon} name={n.name} size="sm" />
                            {n.name}
                          </span>
                        </td>

                        {wss && (
                          <td>
                            <div className="wss-select">
                              <button
                                className={`wss-select-btn ${sel ? 'picked' : ''}`}
                                onClick={() => setOpenMenu(openMenu === rowKey ? null : rowKey)}
                              >
                                {sel ? (
                                  <>
                                    <img src={sel.icon} alt="" />
                                    <span>{sel.name}</span>
                                  </>
                                ) : (
                                  <span className="dim">Select provider</span>
                                )}
                                <Icon.ChevronDown size={13} />
                              </button>
                              {openMenu === rowKey && (
                                <div className="wss-menu">
                                  {n.wssProviders.map((p) => (
                                    <button
                                      key={p.name}
                                      className={`wss-menu-item ${provider === p.name ? 'on' : ''}`}
                                      onClick={() => { setWssProv((s) => ({ ...s, [rowKey]: p.name })); setOpenMenu(null); }}
                                    >
                                      <img src={p.icon} alt="" />
                                      <span>{p.name}</span>
                                      {provider === p.name && <Icon.Check size={13} />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        <td>
                          <div className="rpc-url">
                            <span className={`mono rpc-url-text ${wss && !provider ? 'dim' : ''}`}>{url}</span>
                            <button
                              className="rpc-url-copy"
                              aria-label="Copy URL"
                              disabled={wss && !provider}
                              onClick={() => copy(url, rowKey)}
                            >
                              {isCopied(rowKey) ? <Icon.Check size={14} /> : <Icon.Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="dim">{n.lastRequest}</td>
                      </tr>
                    );
                  })}
            </Table>
          </Panel>
        );
      })}

      {openMenu && <div className="wss-backdrop" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
