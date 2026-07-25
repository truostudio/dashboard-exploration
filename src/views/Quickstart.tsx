import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { Segmented } from '../components/Segmented';
import {
  TitledPanel, Field, TextInput, Form, FormActions, Badge, CopyButton,
} from '../components/ui';
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
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [hookUrl, setHookUrl] = useState('');
  const [hookEvent, setHookEvent] = useState<'address.activity' | 'nft.mint' | 'dex.swap'>('address.activity');
  const [inviteEmail, setInviteEmail] = useState('');

  const code = useMemo(() => snippet(lang), [lang]);

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
      <section className="qs-hero blueprint-bg marks-4 rise rise-1">
        <div className="qs-hero-inner">
          <span className="eyebrow">Quickstart · 00 / 05</span>
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

      <TitledPanel
        title="1 · Your API key"
        sub="Sent as a Bearer token on every request. Rotate at any time without downtime."
        actions={<Badge tone="success"><Icon.Check size={11} /> Ready</Badge>}
      >
        <div className="key-display">
          <span className="mono key-display-text">{apiKey}</span>
          <CopyButton value={apiKey} variant="default" label="Copy key" copiedLabel="Copied" size={13} />
          <button className="btn ghost">
            <Icon.Refresh size={13} /> Rotate
          </button>
        </div>
      </TitledPanel>

      <TitledPanel
        id="qs-step-3"
        title="2 · Make your first call"
        sub="Pick a language, then click Run to send a real request from this page."
        actions={
          <Badge tone={callMade ? 'success' : 'neutral'}>
            {callMade ? <><Icon.Check size={11} /> Done</> : 'Pending'}
          </Badge>
        }
      >

        <div className="code-block">
          <div className="code-tabs">
            <Segmented
              label="Language"
              value={lang}
              onChange={setLang}
              options={langs.map((l) => ({ value: l.id, label: l.label }))}
            />
            <div className="code-tabs-spacer" />
            <CopyButton value={code} copyKey="snippet" label="Copy" size={12} className="code-copy" />
            <button className="btn primary" onClick={run} disabled={running}>
              <Icon.Play size={12} /> {running ? 'Running…' : 'Run'}
            </button>
          </div>
          <pre className="code-pre mono">{code}</pre>
        </div>

        <div className="response-block">
          <div className="response-head">
            <Badge tone="solid">200 OK</Badge>
            <span className="dim mono">via Alchemy · 64ms · ethereum</span>
            {response && (
              <CopyButton value={response} copyKey="response" label="Copy" size={12} className="code-copy" />
            )}
          </div>
          <pre className="code-pre mono response-pre">
            {running
              ? 'Awaiting response…'
              : response ?? '// Hit Run to see a live response from the routing layer.'}
          </pre>
        </div>
      </TitledPanel>

      <section className="qs-grid">
        <TitledPanel
          title="3 · Subscribe to a webhook"
          sub="Stream events to your backend. Signed payloads, automatic retries."
          actions={
            <Badge tone={webhookAdded ? 'success' : 'neutral'}>
              {webhookAdded ? <><Icon.Check size={11} /> Done</> : 'Optional'}
            </Badge>
          }
        >
          <Form>
            <Field label="Endpoint URL" as="label">
              <TextInput
                value={hookUrl}
                onChange={setHookUrl}
                placeholder="https://api.yourapp.com/uniblock/events"
              />
            </Field>
            <Field label="Event">
              <Segmented
                label="Webhook event"
                value={hookEvent}
                onChange={setHookEvent}
                options={[
                  { value: 'address.activity', label: 'address.activity' },
                  { value: 'nft.mint', label: 'nft.mint' },
                  { value: 'dex.swap', label: 'dex.swap' },
                ]}
              />
            </Field>
            <FormActions>
              <button className="btn primary" disabled={!hookUrl} onClick={onWebhookAdded}>
                <Icon.Plus size={13} /> Create webhook
              </button>
              <button className="btn ghost" onClick={() => onNavigate('webhooks')}>
                Manage all
              </button>
            </FormActions>
          </Form>
        </TitledPanel>

        <TitledPanel
          title="4 · Invite your team"
          sub="Add teammates so they can ship without sharing your key."
          actions={
            <Badge tone={teamInvited ? 'success' : 'neutral'}>
              {teamInvited ? <><Icon.Check size={11} /> Done</> : 'Optional'}
            </Badge>
          }
        >
          <Form>
            <Field label="Teammate email" as="label">
              <TextInput
                type="email"
                value={inviteEmail}
                onChange={setInviteEmail}
                placeholder="alice@yourcompany.xyz"
              />
            </Field>
            <FormActions>
              <button className="btn primary" disabled={!inviteEmail.includes('@')} onClick={onTeamInvited}>
                <Icon.Mail size={13} /> Send invite
              </button>
              <button className="btn ghost" onClick={() => onNavigate('settings-team')}>
                Open team
              </button>
            </FormActions>
          </Form>
        </TitledPanel>
      </section>

      <TitledPanel
        title="5 · Add billing (when you're ready)"
        sub="You're on the free plan. Add a payment method to lift the 40M CU cap."
        actions={
          <Badge tone={paymentAdded ? 'success' : 'neutral'}>
            {paymentAdded ? <><Icon.Check size={11} /> Done</> : 'Optional'}
          </Badge>
        }
      >
        <FormActions>
          <button className="btn" onClick={() => onNavigate('settings-billing')}>
            <Icon.Card size={13} /> Open billing
          </button>
          <button className="btn ghost">Compare plans</button>
        </FormActions>
      </TitledPanel>
    </div>
  );
}
