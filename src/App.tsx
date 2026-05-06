import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Overview } from './views/Overview';
import { Endpoints } from './views/Endpoints';
import { Placeholder } from './views/Placeholder';
import { NewProject } from './views/NewProject';
import { Quickstart } from './views/Quickstart';
import { Logs } from './views/Logs';
import { SettingsProject } from './views/SettingsProject';
import { SettingsTeam } from './views/SettingsTeam';
import { SettingsKeys } from './views/SettingsKeys';
import { SettingsBilling } from './views/SettingsBilling';
import './App.css';

export type ViewId =
  | 'quickstart'
  | 'overview'
  | 'endpoints'
  | 'api-tester'
  | 'webhooks'
  | 'logs'
  | 'settings-project'
  | 'settings-team'
  | 'settings-keys'
  | 'settings-billing';

const titles: Record<ViewId, { title: string; subtitle: string }> = {
  quickstart: {
    title: 'Quickstart',
    subtitle: 'A guided path from zero to your first production request.',
  },
  overview: {
    title: 'Overview',
    subtitle: 'Live snapshot of requests, latency, and routing health.',
  },
  endpoints: {
    title: 'Endpoints',
    subtitle: 'Unified APIs, Direct APIs, and JSON-RPC for eth-mainnet-prod.',
  },
  'api-tester': {
    title: 'API Tester',
    subtitle: 'Try any endpoint against live data with your project credentials.',
  },
  webhooks: {
    title: 'Webhooks',
    subtitle: 'Subscribe to address activity, mints, swaps, and contract events.',
  },
  logs: {
    title: 'Logs',
    subtitle: 'Live request log with filters, status, and per-call routing detail.',
  },
  'settings-project': {
    title: 'Project',
    subtitle: 'General settings, routing rules, limits, and danger zone.',
  },
  'settings-team': {
    title: 'Team',
    subtitle: 'Members, invites, and roles for this project.',
  },
  'settings-keys': {
    title: 'API Keys',
    subtitle: 'Scoped, rotatable keys for every environment.',
  },
  'settings-billing': {
    title: 'Billing',
    subtitle: 'Plan, usage, payment method, and invoices.',
  },
};

function App() {
  const [view, setView] = useState<ViewId>('quickstart');
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  // Quickstart progress (real signals from user actions)
  const [callMade, setCallMade] = useState(false);
  const [webhookAdded, setWebhookAdded] = useState(false);
  const [teamInvited, setTeamInvited] = useState(false);
  const [paymentAdded] = useState(false);
  const [getStartedDismissed, setGetStartedDismissed] = useState(false);

  const quickstartSteps = [
    { id: 'project',  label: 'Create a project',     description: 'eth-mainnet-prod is live across 14 chains.', done: true,           cta: { label: 'Review',         target: 'settings-project' as ViewId } },
    { id: 'key',      label: 'Grab your API key',    description: 'Use it as a Bearer token on every request.', done: true,           cta: { label: 'View key',       target: 'settings-keys' as ViewId } },
    { id: 'call',     label: 'Make your first call', description: 'Run a sample request from inside Quickstart.', done: callMade,     cta: { label: 'Open Quickstart', target: 'quickstart' as ViewId } },
    { id: 'webhook',  label: 'Subscribe to events',  description: 'Get notified the moment a wallet moves.',     done: webhookAdded, cta: { label: 'Add webhook',     target: 'webhooks' as ViewId } },
    { id: 'team',     label: 'Invite your team',     description: 'Share access without sharing keys.',          done: teamInvited,  cta: { label: 'Invite team',     target: 'settings-team' as ViewId } },
  ];
  const done = quickstartSteps.filter((s) => s.done).length;

  const meta = titles[view];

  return (
    <div className="app">
      <Sidebar
        view={view}
        onNavigate={setView}
        onNewProject={() => setNewProjectOpen(true)}
        quickstartProgress={{ done, total: quickstartSteps.length }}
      />

      <div className="main-col">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onNewProject={() => setNewProjectOpen(true)}
        />
        <main className="content" role="main">
          {view === 'quickstart' && (
            <Quickstart
              onNavigate={setView}
              callMade={callMade}
              webhookAdded={webhookAdded}
              teamInvited={teamInvited}
              paymentAdded={paymentAdded}
              onCallMade={() => setCallMade(true)}
              onWebhookAdded={() => setWebhookAdded(true)}
              onTeamInvited={() => setTeamInvited(true)}
            />
          )}
          {view === 'overview' && (
            <Overview
              steps={quickstartSteps}
              showGetStarted={!getStartedDismissed && done < quickstartSteps.length}
              onNavigate={setView}
              onDismissGetStarted={() => setGetStartedDismissed(true)}
            />
          )}
          {view === 'endpoints' && <Endpoints />}
          {view === 'api-tester' && (
            <Placeholder
              title="API Tester"
              icon="Beaker"
              description="Composer with prefilled credentials, language tabs, and live response inspection. For now, use the runnable snippet inside Quickstart."
            />
          )}
          {view === 'webhooks' && (
            <Placeholder
              title="Webhooks"
              icon="Webhook"
              description="Real-time event delivery for address activity, NFT mints, DEX swaps, and contract events across every supported chain."
            />
          )}
          {view === 'logs' && <Logs />}
          {view === 'settings-project' && <SettingsProject />}
          {view === 'settings-team' && <SettingsTeam />}
          {view === 'settings-keys' && <SettingsKeys />}
          {view === 'settings-billing' && <SettingsBilling />}
        </main>
      </div>

      <NewProject open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  );
}

export default App;
