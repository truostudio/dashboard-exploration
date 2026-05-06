import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { chains, providers } from '../data/mock';

type Capability = 'unified' | 'direct' | 'json-rpc' | 'webhooks';

const capabilityList: { id: Capability; label: string; description: string; icon: keyof typeof Icon }[] = [
  { id: 'unified', label: 'Unified APIs', description: 'Tokens, NFTs, transactions, market data — normalized across providers', icon: 'Grid' },
  { id: 'direct', label: 'Direct APIs', description: 'Provider-specific endpoints with Uniblock auth and routing', icon: 'Send' },
  { id: 'json-rpc', label: 'JSON-RPC', description: 'Standard RPC with automatic failover across the routing pool', icon: 'Code' },
  { id: 'webhooks', label: 'Webhooks', description: 'Subscribe to address activity, mints, swaps and contract events', icon: 'Webhook' },
];

const chainCategoryLabel: Record<string, string> = {
  evm: 'EVM',
  l2: 'L2',
  solana: 'Solana',
  bitcoin: 'Bitcoin',
  cosmos: 'Cosmos',
  other: 'Other',
};

type Step = 0 | 1 | 2 | 3;

type Props = { open: boolean; onClose: () => void };

export function NewProject({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [env, setEnv] = useState<'dev' | 'staging' | 'prod'>('dev');
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set(['ethereum']));
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set(['alchemy', 'quicknode']));
  const [selectedCaps, setSelectedCaps] = useState<Set<Capability>>(new Set(['unified', 'json-rpc']));
  const [chainQuery, setChainQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(0);
      setName('');
      setEnv('dev');
      setSelectedChains(new Set(['ethereum']));
      setSelectedProviders(new Set(['alchemy', 'quicknode']));
      setSelectedCaps(new Set(['unified', 'json-rpc']));
      setChainQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filteredChains = useMemo(() => {
    if (!chainQuery.trim()) return chains;
    const q = chainQuery.toLowerCase();
    return chains.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [chainQuery]);

  const groupedChains = useMemo(() => {
    const groups: Record<string, typeof chains> = {};
    for (const c of filteredChains) {
      groups[c.category] ||= [];
      groups[c.category].push(c);
    }
    return groups;
  }, [filteredChains]);

  if (!open) return null;

  const stepLabels = ['Project', 'Chains', 'Providers', 'Capabilities'];

  function toggle<T>(set: Set<T>, value: T) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function next() {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else onClose();
  }
  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  const canAdvance =
    step === 0 ? name.trim().length > 1 :
    step === 1 ? selectedChains.size > 0 :
    step === 2 ? selectedProviders.size > 0 :
    selectedCaps.size > 0;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="New project" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h2 className="modal-title">New project</h2>
            <p className="modal-sub dim">
              Spin up a Uniblock project with the chains, providers, and APIs you need.
            </p>
          </div>
          <button className="btn ghost icon-only" aria-label="Close" onClick={onClose}>
            <Icon.X size={16} />
          </button>
        </header>

        <div className="stepper">
          {stepLabels.map((label, i) => (
            <div key={label} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <span className="step-dot">{i < step ? <Icon.Check size={11} /> : i + 1}</span>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 0 && (
            <div className="form">
              <label className="field">
                <span className="field-label">Project name</span>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. multi-chain-prod"
                  autoFocus
                />
              </label>
              <div className="field">
                <span className="field-label">Environment</span>
                <div className="seg">
                  {(['dev', 'staging', 'prod'] as const).map((e) => (
                    <button
                      key={e}
                      className={`seg-item ${env === e ? 'active' : ''}`}
                      onClick={() => setEnv(e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="picker">
              <div className="picker-head">
                <div className="tb-search small">
                  <Icon.Search size={13} />
                  <input
                    value={chainQuery}
                    onChange={(e) => setChainQuery(e.target.value)}
                    placeholder="Search 280+ chains…"
                    aria-label="Search chains"
                  />
                </div>
                <span className="dim">
                  {selectedChains.size} selected
                </span>
              </div>

              <div className="picker-body">
                {Object.entries(groupedChains).map(([cat, list]) => (
                  <div key={cat} className="picker-group">
                    <div className="picker-group-label">
                      {chainCategoryLabel[cat] ?? cat}
                    </div>
                    <div className="chain-grid">
                      {list.map((c) => {
                        const on = selectedChains.has(c.id);
                        return (
                          <button
                            key={c.id}
                            className={`chain-card ${on ? 'on' : ''}`}
                            onClick={() => setSelectedChains(toggle(selectedChains, c.id))}
                          >
                            <span
                              className="chain-mark"
                              style={{ background: c.color }}
                              aria-hidden
                            />
                            <span className="chain-name">{c.name}</span>
                            <span className="mono dim chain-sym">{c.symbol}</span>
                            {on && <Icon.Check size={14} className="chain-check" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="picker">
              <div className="picker-head">
                <p className="dim">
                  Choose which providers Uniblock can route to. We’ll pick the
                  fastest and most reliable for each request.
                </p>
                <span className="dim">{selectedProviders.size} selected</span>
              </div>
              <div className="prov-grid">
                {providers.map((p) => {
                  const on = selectedProviders.has(p.id);
                  return (
                    <button
                      key={p.id}
                      className={`prov-card ${on ? 'on' : ''}`}
                      onClick={() => setSelectedProviders(toggle(selectedProviders, p.id))}
                    >
                      <div className="prov-card-head">
                        <span className="prov-name-lg">{p.name}</span>
                        <span className={`badge ${p.status === 'operational' ? 'success' : 'danger'}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="prov-desc">{p.description}</p>
                      <div className="prov-meta">
                        <span className="mono dim">{p.latencyMs}ms p50</span>
                        <span className="mono dim">{p.uptime}% uptime</span>
                      </div>
                      {on && <Icon.Check size={14} className="prov-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="picker">
              <div className="cap-list">
                {capabilityList.map((c) => {
                  const on = selectedCaps.has(c.id);
                  const I = Icon[c.icon];
                  return (
                    <button
                      key={c.id}
                      className={`cap-card ${on ? 'on' : ''}`}
                      onClick={() => setSelectedCaps(toggle(selectedCaps, c.id))}
                    >
                      <span className="cap-icon"><I size={16} /></span>
                      <div className="cap-text">
                        <span className="cap-name">{c.label}</span>
                        <span className="cap-desc dim">{c.description}</span>
                      </div>
                      <span className={`cap-toggle ${on ? 'on' : ''}`} aria-hidden>
                        {on && <Icon.Check size={12} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <footer className="modal-foot">
          <span className="dim modal-foot-sum">
            {step === 0 && 'Name your project to get started'}
            {step === 1 && `${selectedChains.size} chain${selectedChains.size === 1 ? '' : 's'} selected`}
            {step === 2 && `${selectedProviders.size} provider${selectedProviders.size === 1 ? '' : 's'} selected`}
            {step === 3 && `${selectedCaps.size} capabilit${selectedCaps.size === 1 ? 'y' : 'ies'} selected`}
          </span>
          <div className="modal-foot-actions">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            {step > 0 && (
              <button className="btn" onClick={back}>Back</button>
            )}
            <button className="btn primary" onClick={next} disabled={!canAdvance}>
              {step === 3 ? 'Create project' : 'Continue'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
