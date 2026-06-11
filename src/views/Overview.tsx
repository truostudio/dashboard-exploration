import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Icon } from '../components/Icons';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { GetStarted } from '../components/GetStarted';
import type { Step } from '../components/GetStarted';
import { overviewUsage, overviewKpis } from '../data/mock';
import type { ViewId } from '../App';

const API_KEY = 'ub_live_8f4c2a91b73e5a90c1f6d8e2b5a7c3d9';

const exploreCards = [
  { title: 'JSON-RPC reference', description: 'Browse supported methods, request/response formats, and examples.', target: 'json-rpc' as ViewId },
  { title: 'Token API',          description: 'Token metadata, balances, and contract-related token data.',        target: 'apis-unified' as ViewId },
  { title: 'Transaction API',    description: 'Transaction lookups and transaction-related data.',                  target: 'apis-unified' as ViewId },
];

const prompts: { label: string; template: string }[] = [
  { label: 'Set up Uniblock', template: `I want to integrate Uniblock's Unified API into this project. Reference https://docs.uniblock.dev/llms.txt for the full API documentation. Detect my project's language, framework, and package manager, then:
1) Install any needed dependencies
2) Create a Uniblock client utility configured with API key {apiKey}
3) Replace any existing blockchain provider calls with Uniblock equivalents
4) Add error handling for Uniblock's response format` },
  { label: 'Explore what to build', template: `I'm exploring Uniblock's blockchain API. Reference https://docs.uniblock.dev/llms.txt for documentation. My API key is {apiKey}. Show me 3 practical things I can build with Uniblock, with working code examples for each. Start with the simplest (a single API call) and progress to more complex (combining multiple endpoints).` },
  { label: 'Audit blockchain setup', template: `You are a blockchain infrastructure consultant. Scan this codebase for all blockchain API and RPC provider integrations. For each one found, reference https://docs.uniblock.dev/llms.txt to determine if Uniblock's Unified API covers the same functionality. Output a migration report with: providers found, endpoints in use, Uniblock equivalents, and a step-by-step migration plan. My Uniblock API key is {apiKey}.` },
  { label: 'Provider consolidation', template: `You are a blockchain infrastructure migration engineer. Scan this codebase for all blockchain provider integrations: Alchemy, QuickNode, Infura, Moralis, Helius, Ankr, or any direct RPC endpoint URLs. Reference https://docs.uniblock.dev/llms.txt for Uniblock's full API surface. For each provider integration found, output: (1) file path and line numbers, (2) provider name and chain, (3) methods/endpoints called, (4) Uniblock equivalent endpoint and estimated compute units per call, (5) replacement code using Uniblock's API with key {apiKey}.` },
  { label: 'Web2.5 SaaS', template: `This application needs blockchain data. The developers on this team are experienced backend/frontend engineers but new to blockchain APIs. Reference https://docs.uniblock.dev/llms.txt for Uniblock's API documentation. Generate an integration layer that maps blockchain concepts to familiar patterns (wallet address = user ID, transaction = event, token balance = account balance) and includes a typed Uniblock client with clear method names. My Uniblock API key is {apiKey}.` },
  { label: 'MCP server', template: `Configure this project to use Uniblock's MCP server for blockchain data access through Claude or Cursor. The MCP endpoint is https://uniblock-api-mcp.floral-tooth-bcc0.workers.dev/mcp. Reference https://docs.uniblock.dev/llms.txt for the full API surface. Set up MCP client configuration for the IDE in use and a test workflow that queries token balances. Note: the MCP server is a developer preview and does not require an API key.` },
];

type Props = {
  steps: Step[];
  showGetStarted: boolean;
  onNavigate: (id: ViewId) => void;
  onDismissGetStarted: () => void;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function Overview({ steps, showGetStarted, onNavigate, onDismissGetStarted }: Props) {
  const [keyShown, setKeyShown] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [tab, setTab] = useState<'unified' | 'json-rpc'>('unified');
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const masked = `${API_KEY.slice(0, 11)}${'•'.repeat(14)}`;
  const promptText = prompts[promptIdx].template.replace(/{apiKey}/g, API_KEY);

  function run() {
    setRunning(true);
    setResponse(null);
    setTimeout(() => {
      setRunning(false);
      setResponse(
        tab === 'unified'
          ? `{\n  "chain": "ethereum",\n  "address": "0xab58…aec9b",\n  "balance_decimal": "2.0",\n  "symbol": "ETH",\n  "provider": "alchemy",\n  "latency_ms": 64\n}`
          : `{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "result": "0x12e1f4a"\n}`,
      );
    }, 700);
  }

  return (
    <div className="view">
      {showGetStarted && (
        <div className="rise rise-1">
          <GetStarted steps={steps} onNavigate={onNavigate} onDismiss={onDismissGetStarted} />
        </div>
      )}

      {/* API key strip */}
      <article className="panel keystrip rise rise-1">
        <Icon.Key size={16} className="dim" />
        <span className="keystrip-label">API key</span>
        <span className="mono keystrip-key">{keyShown ? API_KEY : masked}</span>
        <button className="btn ghost icon-only" aria-label="Show key" onClick={() => setKeyShown((v) => !v)}>
          <Icon.Eye size={14} />
        </button>
        <button className="btn ghost icon-only" aria-label="Copy key" onClick={() => { navigator.clipboard?.writeText(API_KEY); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 1200); }}>
          {copiedKey ? <Icon.Check size={14} /> : <Icon.Copy size={14} />}
        </button>
        <button className="btn" onClick={() => onNavigate('settings-project')}>Manage</button>
      </article>

      {/* Total requests */}
      <article className="panel rise rise-2">
        <header className="panel-head">
          <div>
            <span className="eyebrow">Last 30 days</span>
            <h2 className="panel-title">Total requests</h2>
          </div>
        </header>
        <div className="kpi-tiles">
          <div className="kpi-tile">
            <AnimatedNumber className="kpi-tile-num" value={overviewKpis.total.toLocaleString()} />
            <span className="kpi-tile-label">Total requests</span>
          </div>
          <div className="kpi-tile">
            <AnimatedNumber className="kpi-tile-num" value={`${overviewKpis.successRate}%`} />
            <span className="kpi-tile-label">Success rate</span>
          </div>
          <div className="kpi-tile">
            <AnimatedNumber className="kpi-tile-num" value={`${overviewKpis.avgLatency} ms`} />
            <span className="kpi-tile-label">Avg latency</span>
          </div>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={overviewUsage.rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ovFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ub-blue)" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="var(--ub-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="ts"
                stroke="var(--ub-text-3)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(34,34,34,0.08)' }}
                tickMargin={8}
                tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                minTickGap={40}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <Tooltip
                contentStyle={{ background: 'var(--ub-elevated)', border: '1px solid rgba(34,34,34,0.08)', borderRadius: 10, fontSize: 12, fontFamily: 'var(--font-mono)', boxShadow: 'var(--shadow-md)' }}
                labelFormatter={(t) => new Date(Number(t)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                formatter={(v) => [fmt(Number(v)), 'requests']}
              />
              <Area type="monotone" dataKey="total" stroke="var(--ub-blue)" strokeWidth={2} fill="url(#ovFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* Explore APIs */}
      <section className="explore-grid rise rise-3">
        {exploreCards.map((c) => (
          <button key={c.title} className="explore-card" onClick={() => onNavigate(c.target)}>
            <span className="explore-icon"><Icon.Code size={20} /></span>
            <span className="explore-title">{c.title}</span>
            <span className="explore-desc dim">{c.description}</span>
            <Icon.External size={16} className="explore-ext" />
          </button>
        ))}
      </section>

      {/* Test an Endpoint */}
      <article className="panel rise rise-4">
        <header className="panel-head">
          <div>
            <span className="eyebrow">Live</span>
            <h2 className="panel-title">Test an Endpoint</h2>
            <p className="panel-sub dim">Send a live request and watch Uniblock route it.</p>
          </div>
          <div className="seg">
            <button className={`seg-item ${tab === 'unified' ? 'active' : ''}`} onClick={() => { setTab('unified'); setResponse(null); }}>Unified API</button>
            <button className={`seg-item ${tab === 'json-rpc' ? 'active' : ''}`} onClick={() => { setTab('json-rpc'); setResponse(null); }}>JSON-RPC</button>
          </div>
        </header>

        <div className="composer-row">
          {tab === 'unified' ? (
            <>
              <span className="badge method-get">GET</span>
              <select className="input" defaultValue="/token/balance">
                <option>/token/balance</option>
                <option>/nft/metadata</option>
                <option>/market/price</option>
              </select>
            </>
          ) : (
            <>
              <span className="badge method-post">POST</span>
              <select className="input" defaultValue="eth_blockNumber">
                <option>eth_blockNumber</option>
                <option>eth_getBalance</option>
                <option>eth_call</option>
              </select>
            </>
          )}
          <button className="btn primary" onClick={run} disabled={running}>
            {running ? <Icon.Refresh size={13} /> : <Icon.Play size={13} />}
            {running ? 'Routing…' : 'Send'}
          </button>
        </div>

        {response && (
          <div className="response-block">
            <div className="response-head">
              <span className="badge success">200 OK</span>
              <span className="mono dim">64 ms</span>
              <span className="badge">alchemy</span>
            </div>
            <pre className="code-pre response-pre">{response}</pre>
          </div>
        )}
      </article>

      {/* AI IDE prompt */}
      <article className="panel rise rise-5">
        <header className="panel-head">
          <div>
            <span className="eyebrow">Vibe-code it</span>
            <h2 className="panel-title">AI IDE prompt</h2>
            <p className="panel-sub dim">Paste into Cursor, Claude Code, or any agent to wire up Uniblock.</p>
          </div>
          <select className="input prompt-select" value={promptIdx} onChange={(e) => setPromptIdx(Number(e.target.value))}>
            {prompts.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
          </select>
        </header>
        <div className="code-block">
          <div className="code-tabs">
            <span className="mono dim" style={{ fontSize: 12, padding: '0 4px' }}>prompt.txt</span>
            <span className="code-tabs-spacer" />
            <button className="btn code-copy" onClick={() => { navigator.clipboard?.writeText(promptText); setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 1200); }}>
              {copiedPrompt ? <Icon.Check size={12} /> : <Icon.Copy size={12} />} {copiedPrompt ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="code-pre prompt-pre">{promptText}</pre>
        </div>
      </article>
    </div>
  );
}
