import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CommandPalette } from './components/CommandPalette';
import { SiteBanner } from './components/SiteBanner';
import { Overview } from './views/Overview';
import { Analytics } from './views/Analytics';
import { UnifiedApis } from './views/UnifiedApis';
import { DirectApis } from './views/DirectApis';
import { AllApis } from './views/AllApis';
import { Chains } from './views/Chains';
import { Nodes } from './views/Nodes';
import { JsonRpc } from './views/JsonRpc';
import { Webhooks } from './views/Webhooks';
import { ApiTester } from './views/ApiTester';
import { NewProject } from './views/NewProject';
import { Quickstart } from './views/Quickstart';
import { SettingsProject } from './views/SettingsProject';
import { SettingsTeam } from './views/SettingsTeam';
import { SettingsBilling } from './views/SettingsBilling';
import { Components } from './views/Components';
import { useTheme } from './theme';
import { viewFromPath, focusFromSearch, urlFor } from './routes';
import './components/ui/ui.css';
import './App.css';

export type ViewId =
  | 'quickstart'
  | 'overview'
  | 'analytics'
  | 'apis-unified'
  | 'apis-direct'
  | 'apis-all'
  | 'chains'
  | 'nodes'
  | 'json-rpc'
  | 'webhooks'
  | 'api-tester'
  | 'settings-project'
  | 'settings-team'
  | 'settings-billing'
  | 'components';

const titles: Record<ViewId, { section: string; title: string; subtitle: string }> = {
  quickstart: {
    section: 'Get started',
    title: 'Quickstart',
    subtitle: 'A guided path from zero to your first production request.',
  },
  overview: {
    section: 'Project',
    title: 'Overview',
    subtitle: 'Live snapshot of requests, latency, and routing health.',
  },
  analytics: {
    section: 'Project',
    title: 'Analytics',
    subtitle: 'Usage, performance, and cost trends for eth-mainnet-prod.',
  },
  'apis-unified': {
    section: 'APIs',
    title: 'Unified APIs',
    subtitle: 'One normalized interface across 300+ chains and 55+ providers.',
  },
  'apis-direct': {
    section: 'APIs',
    title: 'Direct APIs',
    subtitle: 'Provider-native endpoints, proxied through your project.',
  },
  'apis-all': {
    section: 'APIs',
    title: 'All APIs',
    subtitle: 'Every Unified category and Direct provider in one place.',
  },
  chains: {
    section: 'APIs',
    title: 'Chains',
    subtitle: 'Every chain this project can reach, and what it is carrying.',
  },
  nodes: {
    section: 'Real-time',
    title: 'Nodes',
    subtitle: 'Dedicated node capacity, reserved for your project.',
  },
  'json-rpc': {
    section: 'Project',
    title: 'JSON-RPC',
    subtitle: 'Raw node access with automatic provider routing.',
  },
  webhooks: {
    section: 'Project',
    title: 'Webhooks',
    subtitle: 'Subscribe to address activity, mints, swaps, and contract events.',
  },
  'api-tester': {
    section: 'Project',
    title: 'API Tester',
    subtitle: 'Try any endpoint against live data with your project credentials.',
  },
  'settings-project': {
    section: 'Settings',
    title: 'Project',
    subtitle: 'General settings, routing rules, limits, and danger zone.',
  },
  'settings-team': {
    section: 'Settings',
    title: 'Team',
    subtitle: 'Members, invites, and roles for this project.',
  },
  'settings-billing': {
    section: 'Settings',
    title: 'Billing',
    subtitle: 'Plan, usage, payment method, and invoices.',
  },
  components: {
    section: 'Developer',
    title: 'Components',
    subtitle: 'Internal reference for every token, utility, and component.',
  },
};

function App() {
  // Seeded from the URL, so a deep link opens the right screen on first paint
  // rather than flashing the default and correcting itself.
  const [view, setView] = useState<ViewId>(() => viewFromPath(window.location.pathname));
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  /**
   * Endpoint the palette asked Analytics to reveal. Held here rather than in
   * Analytics because the palette can fire while you are on another view, so
   * the request has to outlive the navigation that serves it.
   */
  const [focusEndpoint, setFocusEndpoint] = useState<string | null>(
    () => focusFromSearch(window.location.search).endpoint ?? null,
  );
  const [focusChain, setFocusChain] = useState<string | null>(
    () => focusFromSearch(window.location.search).chain ?? null,
  );
  const { theme, toggleTheme } = useTheme();

  // ⌘K / Ctrl+K anywhere, and "/" when you are not already typing. Bound on the
  // document so the shortcut works without the topbar field ever holding focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /**
   * Navigation and the address bar move together. `push` is false only when the
   * URL already changed on its own — i.e. the user pressed Back — otherwise the
   * history stack would grow an entry every time it was popped.
   */
  const go = (id: ViewId, focus?: { endpoint?: string; chain?: string }, push = true) => {
    setView(id);
    setNavOpen(false);
    setFocusEndpoint(focus?.endpoint ?? null);
    setFocusChain(focus?.chain ?? null);
    const next = urlFor(id, focus);
    if (push && next !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', next);
    }
  };

  const navigate = (id: ViewId) => go(id);

  // Back and forward drive the app rather than leaving it.
  useEffect(() => {
    const onPop = () => {
      const focus = focusFromSearch(window.location.search);
      go(viewFromPath(window.location.pathname), focus, false);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // A bare `/` should become a real address, so a refresh or a copied link
  // lands somewhere specific.
  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState({}, '', urlFor(view));
    }
    // Mount only: this rewrites a bare `/` once. Re-running it on every view
    // change would replace history entries instead of pushing them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={navigate}
        onOpenEndpoint={(name) => go('analytics', { endpoint: name })}
        onOpenChain={(id) => go('chains', { chain: id })}
      />

      <div className="main-col">
        <SiteBanner onNavigate={navigate} />
        <Topbar
          section={meta.section}
          title={meta.title}
          subtitle={meta.subtitle}
          onNewProject={() => setNewProjectOpen(true)}
          onMenu={() => setNavOpen(true)}
          onSearch={() => setPaletteOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="content" role="main">
          <div className="view-swap" key={view}>
          {view === 'quickstart' && (
            <Quickstart
              onNavigate={navigate}
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
              onNavigate={navigate}
              onDismissGetStarted={() => setGetStartedDismissed(true)}
            />
          )}
          {view === 'analytics' && (
            <Analytics
              focusEndpoint={focusEndpoint}
              onFocusHandled={() => {
                setFocusEndpoint(null);
                window.history.replaceState({}, '', urlFor('analytics'));
              }}
            />
          )}
          {view === 'apis-unified' && <UnifiedApis />}
          {view === 'apis-direct' && <DirectApis />}
          {view === 'apis-all' && <AllApis />}
          {view === 'chains' && (
            <Chains
              onNavigate={navigate}
              focusChain={focusChain}
              onFocusHandled={() => {
                setFocusChain(null);
                window.history.replaceState({}, '', urlFor('chains'));
              }}
            />
          )}
          {view === 'nodes' && <Nodes />}
          {view === 'json-rpc' && <JsonRpc />}
          {view === 'webhooks' && <Webhooks />}
          {view === 'api-tester' && <ApiTester />}
          {view === 'settings-project' && <SettingsProject />}
          {view === 'settings-team' && <SettingsTeam />}
          {view === 'settings-billing' && <SettingsBilling />}
          {view === 'components' && <Components />}
          </div>
        </main>
      </div>

      <NewProject open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  );
}

export default App;
