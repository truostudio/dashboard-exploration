import { useState } from 'react';
import { Area, AreaChart, Tooltip, XAxis } from 'recharts';
import { Icon } from '../components/Icons';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { GetStarted } from '../components/GetStarted';
import { Segmented } from '../components/Segmented';
import {
  Panel, TitledPanel, StatTiles, Badge, MethodBadge, Select, CopyButton, useCopy,
} from '../components/ui';
import { ChartFrame, ChartTooltip, chartAxis, chartAxisLine, chartCursor } from '../components/ui/Chart';
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
  const [tab, setTab] = useState<'unified' | 'json-rpc'>('unified');
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const { copy, isCopied } = useCopy();

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
      <Panel className="keystrip rise rise-1">
        <Icon.Key size={16} className="dim" />
        <span className="keystrip-label">API key</span>
        <span className="mono keystrip-key">{keyShown ? API_KEY : masked}</span>
        <button className="btn ghost icon-only" aria-label="Show key" onClick={() => setKeyShown((v) => !v)}>
          <Icon.Eye size={14} />
        </button>
        <CopyButton value={API_KEY} />
        <button className="btn" onClick={() => onNavigate('settings-project')}>Manage</button>
      </Panel>

      {/* Total requests */}
      <TitledPanel className="rise rise-2" eyebrow="Last 30 days" title="Total requests">
        <StatTiles
          columns={3}
          tiles={[
            { id: 'total', label: 'Total requests', value: <AnimatedNumber value={overviewKpis.total.toLocaleString()} /> },
            { id: 'success', label: 'Success rate', value: <AnimatedNumber value={`${overviewKpis.successRate}%`} /> },
            { id: 'latency', label: 'Avg latency', value: <AnimatedNumber value={`${overviewKpis.avgLatency} ms`} /> },
          ]}
        />
        <ChartFrame height={220}>
            <AreaChart data={overviewUsage.rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ovFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ub-blue)" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="var(--ub-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="ts"
                {...chartAxis}
                axisLine={chartAxisLine}
                tickMargin={8}
                tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                minTickGap={40}
              />
              <Tooltip
                cursor={chartCursor}
                content={
                  <ChartTooltip
                    labelFormatter={(t) =>
                      new Date(Number(t)).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })
                    }
                    valueFormatter={(v) => fmt(Number(v))}
                  />
                }
              />
              <Area type="monotone" dataKey="total" stroke="var(--ub-blue)" strokeWidth={2} fill="url(#ovFill)" />
            </AreaChart>
        </ChartFrame>
      </TitledPanel>

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
      <TitledPanel
        className="rise rise-4"
        eyebrow="Live"
        title="Test an Endpoint"
        sub="Send a live request and watch Uniblock route it."
        actions={
          <Segmented
            label="Endpoint surface"
            value={tab}
            onChange={(next) => { setTab(next); setResponse(null); }}
            options={[
              { value: 'unified', label: 'Unified API' },
              { value: 'json-rpc', label: 'JSON-RPC' },
            ]}
          />
        }
      >

        <div className="composer-row">
          {tab === 'unified' ? (
            <>
              <MethodBadge method="GET" />
              <select className="input" defaultValue="/token/balance">
                <option>/token/balance</option>
                <option>/nft/metadata</option>
                <option>/market/price</option>
              </select>
            </>
          ) : (
            <>
              <MethodBadge method="POST" />
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
              <Badge tone="success">200 OK</Badge>
              <span className="mono dim">64 ms</span>
              <Badge>alchemy</Badge>
            </div>
            <pre className="code-pre response-pre">{response}</pre>
          </div>
        )}
      </TitledPanel>

      {/* AI IDE prompt */}
      <TitledPanel
        className="rise rise-5"
        eyebrow="Vibe-code it"
        title="AI IDE prompt"
        sub="Paste into Cursor, Claude Code, or any agent to wire up Uniblock."
        actions={
          <Select
            label="Prompt"
            value={String(promptIdx)}
            onChange={(v) => setPromptIdx(Number(v))}
            options={prompts.map((p, i) => ({ value: String(i), label: p.label }))}
          />
        }
      >
        <div className="code-block">
          <div className="code-tabs">
            <span className="mono dim code-filename">prompt.txt</span>
            <span className="code-tabs-spacer" />
            <button className="btn code-copy" onClick={() => copy(promptText, 'prompt')}>
              {isCopied('prompt') ? <Icon.Check size={12} /> : <Icon.Copy size={12} />}
              {isCopied('prompt') ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="code-pre prompt-pre">{promptText}</pre>
        </div>
      </TitledPanel>
    </div>
  );
}
