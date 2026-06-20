import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Overview } from './views/Overview';
import { Analytics } from './views/Analytics';
import { UnifiedApis } from './views/UnifiedApis';
import { DirectApis } from './views/DirectApis';
import { AllApis } from './views/AllApis';
import { JsonRpc } from './views/JsonRpc';
import { Webhooks } from './views/Webhooks';
import { ApiTester } from './views/ApiTester';
import { NewProject } from './views/NewProject';
import { Quickstart } from './views/Quickstart';
import { SettingsProject } from './views/SettingsProject';
import { SettingsTeam } from './views/SettingsTeam';
import { SettingsBilling } from './views/SettingsBilling';
import './App.css';

export type ViewId =
  | 'quickstart'
  | 'overview'
  | 'analytics'
  | 'apis-unified'
  | 'apis-direct'
  | 'apis-all'
  | 'json-rpc'
  | 'webhooks'
  | 'api-tester'
  | 'settings-project'
  | 'settings-team'
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
  analytics: {
    title: 'Analytics',
    subtitle: 'Usage, performance, and cost trends for eth-mainnet-prod.',
  },
  'apis-unified': {
    title: 'Unified APIs',
    subtitle: 'One normalized interface across every supported chain.',
  },
  'apis-direct': {
    title: 'Direct APIs',
    subtitle: 'Provider-native endpoints, proxied through your project.',
  },
  'apis-all': {
    title: 'All APIs',
    subtitle: 'Every Unified, Direct, and JSON-RPC method in one place.',
  },
  'json-rpc': {
    title: 'JSON-RPC',
    subtitle: 'Raw node access with automatic provider routing.',
  },
  webhooks: {
    title: 'Webhooks',
    subtitle: 'Subscribe to address activity, mints, swaps, and contract events.',
  },
  'api-tester': {
    title: 'API Tester',
    subtitle: 'Try any endpoint against live data with your project credentials.',
  },
  'settings-project': {
    title: 'Project',
    subtitle: 'General settings, routing rules, limits, and danger zone.',
  },
  'settings-team': {
    title: 'Team',
    subtitle: 'Members, invites, and roles for this project.',
  },
  'settings-billing': {
    title: 'Billing',
    subtitle: 'Plan, usage, payment method, and invoices.',
  },
};

function App() {
  const [view, setView] = useState<ViewId>('quickstart');
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const navigate = (id: ViewId) => {
    setView(id);
    setNavOpen(false);
  };

  // Quickstart progress (real signals from user actions)
  const [callMade, setCallMade] = useState(false);
  const [webhookAdded, setWebhookAdded] = useState(false);
  const [teamInvited, setTeamInvited] = useState(false);
  const [paymentAdded] = useState(false);
  const [getStartedDismissed, setGetStartedDismissed] = useState(false);

  const quickstartSteps = [
    { id: 'project',  label: 'Create a project',     description: 'eth-mainnet-prod is live across 14 chains.', done: true,           cta: { label: 'Review',         target: 'settings-project' as ViewId } },
    { id: 'key',      label: 'Grab your API key',    description: 'Use it as a Bearer token on every request.', done: true,           cta: { label: 'View key',       target: 'settings-project' as ViewId } },
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
        onNavigate={navigate}
        onNewProject={() => { setNewProjectOpen(true); setNavOpen(false); }}
        quickstartProgress={{ done, total: quickstartSteps.length }}
        open={navOpen}
      />
      {navOpen && <div className="nav-backdrop" onClick={() => setNavOpen(false)} />}

      <div className="main-col">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onNewProject={() => setNewProjectOpen(true)}
          onMenu={() => setNavOpen(true)}
        />
        <main className="content" role="main">
          <div className="view-swap" key={view}>
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
          {view === 'analytics' && <Analytics />}
          {view === 'apis-unified' && <UnifiedApis />}
          {view === 'apis-direct' && <DirectApis />}
          {view === 'apis-all' && <AllApis />}
          {view === 'json-rpc' && <JsonRpc />}
          {view === 'webhooks' && <Webhooks />}
          {view === 'api-tester' && <ApiTester />}
          {view === 'settings-project' && <SettingsProject />}
          {view === 'settings-team' && <SettingsTeam />}
          {view === 'settings-billing' && <SettingsBilling />}
          </div>
        </main>
      </div>

      <NewProject open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  );
}

export default App;
