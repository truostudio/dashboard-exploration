import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import type { ViewId } from '../App';

type Lang = 'curl' | 'js' | 'python' | 'go';

const langs: { id: Lang; label: string }[] = [
  { id: 'curl',   label: 'cURL'   },
  { id: 'js',     label: 'Node'   },
  { id: 'python', label: 'Python' },
  { id: 'go',     label: 'Go'     },
];

const apiKey = 'ub_demo_8f4c2a91b73e5a90c1f6d8e2b5a7c3d9';

function snippet(lang: Lang) {
  const url = 'https://api.uniblock.dev/v1/token/balance';
  const params = '?chain=ethereum&address=0xab5801a7d398351b8be11c439e05c5b3259aec9b';
  switch (lang) {
    case 'curl':
      return `curl ${url}${params} \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "X-Project: eth-mainnet-prod"`;
    case 'js':
      return `import { Uniblock } from "@uniblock/sdk";

const ub = new Uniblock({ apiKey: "${apiKey}" });

const balance = await ub.token.balance({
  chain: "ethereum",
  address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b",
});

console.log(balance);`;
    case 'python':
      return `from uniblock import Uniblock

ub = Uniblock(api_key="${apiKey}")

balance = ub.token.balance(
    chain="ethereum",
    address="0xab5801a7d398351b8be11c439e05c5b3259aec9b",
)

print(balance)`;
    case 'go':
      return `client := uniblock.New("${apiKey}")

balance, err := client.Token.Balance(ctx, &uniblock.BalanceParams{
    Chain:   "ethereum",
    Address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b",
})`;
  }
}

const sampleResponse = `{
  "chain": "ethereum",
  "address": "0xab5801a7d398351b8be11c439e05c5b3259aec9b",
  "balance": "0x1bc16d674ec80000",
  "balance_decimal": "2.0",
  "symbol": "ETH",
  "decimals": 18,
  "block": 19834201,
  "provider": "alchemy",
  "latency_ms": 64
}`;

type Props = {
  onNavigate: (id: ViewId) => void;
  callMade: boolean;
  webhookAdded: boolean;
  teamInvited: boolean;
  paymentAdded: boolean;
  onCallMade: () => void;
  onWebhookAdded: () => void;
  onTeamInvited: () => void;
};

export function Quickstart({
  onNavigate,
  callMade,
  webhookAdded,
  teamInvited,
  paymentAdded,
  onCallMade,
  onWebhookAdded,
  onTeamInvited,
}: Props) {
  const [lang, setLang] = useState<Lang>('curl');
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [hookUrl, setHookUrl] = useState('');
  const [hookEvent, setHookEvent] = useState<'address.activity' | 'nft.mint' | 'dex.swap'>('address.activity');
  const [inviteEmail, setInviteEmail] = useState('');

  const code = useMemo(() => snippet(lang), [lang]);

  function copy() {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function run() {
    setRunning(true);
    setResponse(null);
    setTimeout(() => {
      setRunning(false);
      setResponse(sampleResponse);
      onCallMade();
    }, 700);
  }

  return (
    <div className="view">
      <section className="qs-hero blueprint-bg">
        <div className="qs-hero-inner">
          <span className="badge new">QUICKSTART</span>
          <h2 className="qs-hero-title">Make your first request in under a minute.</h2>
          <p className="qs-hero-sub muted">
            Your project is ready. Drop the snippet below into your codebase, hit Run, and Uniblock will route it
            through the fastest healthy provider for the chain you picked.
          </p>
          <div className="qs-hero-actions">
            <button className="btn primary" onClick={() => document.getElementById('qs-step-3')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
              <Icon.Play size={13} /> Run sample request
            </button>
            <button className="btn">
              <Icon.External size={13} /> Open docs
            </button>
            <button className="btn ghost">
              <Icon.Refresh size={13} /> Migrating from Alchemy / Infura
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">1 · Your API key</h2>
            <p className="panel-sub dim">Sent as a Bearer token on every request. Rotate at any time without downtime.</p>
          </div>
          <span className="badge success"><Icon.Check size={11} /> Ready</span>
        </header>
        <div className="key-display">
          <span className="mono key-display-text">{apiKey}</span>
          <button className="btn" onClick={() => { navigator.clipboard?.writeText(apiKey); }}>
            <Icon.Copy size={13} /> Copy key
          </button>
          <button className="btn ghost">
            <Icon.Refresh size={13} /> Rotate
          </button>
        </div>
      </section>

      <section className="panel" id="qs-step-3">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">2 · Make your first call</h2>
            <p className="panel-sub dim">Pick a language, then click Run to send a real request from this page.</p>
          </div>
          <span className={`badge ${callMade ? 'success' : ''}`}>
            {callMade ? <><Icon.Check size={11} /> Done</> : 'Pending'}
          </span>
        </header>

        <div className="code-block">
          <div className="code-tabs">
            {langs.map((l) => (
              <button
                key={l.id}
                className={`code-tab ${lang === l.id ? 'active' : ''}`}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
            <div className="code-tabs-spacer" />
            <button className="btn ghost code-copy" onClick={copy}>
              {copied ? <><Icon.Check size={12} /> Copied</> : <><Icon.Copy size={12} /> Copy</>}
            </button>
            <button className="btn primary" onClick={run} disabled={running}>
              <Icon.Play size={12} /> {running ? 'Running…' : 'Run'}
            </button>
          </div>
          <pre className="code-pre mono">{code}</pre>
        </div>

        <div className="response-block">
          <div className="response-head">
            <span className="badge solid mono">200 OK</span>
            <span className="dim mono">via Alchemy · 64ms · ethereum</span>
            {response && (
              <button className="btn ghost code-copy" onClick={() => navigator.clipboard?.writeText(response)}>
                <Icon.Copy size={12} /> Copy
              </button>
            )}
          </div>
          <pre className="code-pre mono response-pre">
            {running
              ? 'Awaiting response…'
              : response ?? '// Hit Run to see a live response from the routing layer.'}
          </pre>
        </div>
      </section>

      <section className="qs-grid">
        <article className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">3 · Subscribe to a webhook</h2>
              <p className="panel-sub dim">Stream events to your backend. Signed payloads, automatic retries.</p>
            </div>
            <span className={`badge ${webhookAdded ? 'success' : ''}`}>
              {webhookAdded ? <><Icon.Check size={11} /> Done</> : 'Optional'}
            </span>
          </header>
          <div className="form">
            <label className="field">
              <span className="field-label">Endpoint URL</span>
              <input
                className="input"
                value={hookUrl}
                onChange={(e) => setHookUrl(e.target.value)}
                placeholder="https://api.yourapp.com/uniblock/events"
              />
            </label>
            <label className="field">
              <span className="field-label">Event</span>
              <div className="seg">
                {(['address.activity', 'nft.mint', 'dex.swap'] as const).map((ev) => (
                  <button
                    key={ev}
                    className={`seg-item ${hookEvent === ev ? 'active' : ''}`}
                    onClick={() => setHookEvent(ev)}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </label>
            <div className="form-actions">
              <button className="btn primary" disabled={!hookUrl} onClick={onWebhookAdded}>
                <Icon.Plus size={13} /> Create webhook
              </button>
              <button className="btn ghost" onClick={() => onNavigate('webhooks')}>
                Manage all
              </button>
            </div>
          </div>
        </article>

        <article className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">4 · Invite your team</h2>
              <p className="panel-sub dim">Add teammates so they can ship without sharing your key.</p>
            </div>
            <span className={`badge ${teamInvited ? 'success' : ''}`}>
              {teamInvited ? <><Icon.Check size={11} /> Done</> : 'Optional'}
            </span>
          </header>
          <div className="form">
            <label className="field">
              <span className="field-label">Teammate email</span>
              <input
                className="input"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="alice@yourcompany.xyz"
              />
            </label>
            <div className="form-actions">
              <button className="btn primary" disabled={!inviteEmail.includes('@')} onClick={onTeamInvited}>
                <Icon.Mail size={13} /> Send invite
              </button>
              <button className="btn ghost" onClick={() => onNavigate('settings-team')}>
                Open team
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">5 · Add billing (when you're ready)</h2>
            <p className="panel-sub dim">You're on the free plan — add a payment method to lift the 40M CU cap.</p>
          </div>
          <span className={`badge ${paymentAdded ? 'success' : ''}`}>
            {paymentAdded ? <><Icon.Check size={11} /> Done</> : 'Optional'}
          </span>
        </header>
        <div className="form-actions">
          <button className="btn" onClick={() => onNavigate('settings-billing')}>
            <Icon.Card size={13} /> Open billing
          </button>
          <button className="btn ghost">Compare plans</button>
        </div>
      </section>
    </div>
  );
}
