# What's real and what's staged

> For the engineer wiring this to a backend. This is a design build: some interactions
> are fully implemented and ship as-is, some are simulated, and some controls render
> without a handler because the screen needed them to exist before they needed to work.
>
> **Read this before you wire anything.** The risk it exists to prevent is spending a day
> connecting an endpoint to a button that was never an interaction.

Three labels are used throughout:

| Label | Meaning |
|-------|---------|
| **Real** | The logic ships. Filtering, sorting, paging, search, navigation, keyboard handling. It all runs on `src/data/`, and pointing it at live data is the only change needed. |
| **Staged** | Deliberately simulated. Usually a `setTimeout` standing in for a request, or state that lives only in the component. The *shape* is right; the transport is missing. |
| **Inert** | The control renders and is styled, but has no handler. Nothing happens on click. Needs a real implementation, not a rewire. |

---

## Staged: simulated, needs a transport

| Where | What happens now | What it needs |
|-------|------------------|---------------|
| Overview → *Test an Endpoint* → **Send** | `setTimeout(700ms)`, then a hardcoded JSON string. The 200/latency/provider badges are literals. | A real request. Keep the response block; replace the `run()` body in [`Overview.tsx`](../src/views/Overview.tsx). |
| Quickstart → *Make your first call* → **Run** | Same 700ms fake, plus it marks the onboarding step complete. | Same. `onCallMade()` should fire on a successful response, not on a timer. |
| API Tester → **Run** | Same 700ms fake; the Body/Headers/Timing tabs render a fixed sample. | A real request. The tabs are already built for a real response object. |
| Quickstart → **Create webhook** | Enables on a non-empty URL, then only marks the step complete. Nothing is created. | `POST /webhooks`. The form fields already match the `Webhook` type. |
| Quickstart → **Invite** | Enables on an `@`-containing string, then only marks the step complete. | `POST` an invite. |
| Topbar bell → notifications | Read state, per-row read, and *Mark all read* are real, but live in component state, a reload restores the seed from `data/mock.ts`. | Persist read state server-side. The `Notification` type is the contract. |
| Overview rail → *Week in review* | Every figure is derived from `weekInReview` in `data/mock.ts`, itself scaled off the mock 30-day series. The maths is real; the inputs are not. | Compute the same fields server-side. **Cost and time savings are illustrative**, those need real pricing, not a mock constant. |
| Analytics (all tabs) | `snapshot(range, chain)` is a **seeded deterministic generator**, the same range always produces the same numbers. It looks like real telemetry and is not. | Replace `data/analytics.ts` with a fetch returning the same `Snapshot` shape. This is the single biggest data swap in the app. |
| Onboarding progress (`Quickstart n/5`) | Lives in `App.tsx` state; resets on reload. | Persist per-user. |

## Inert: renders, does nothing

These are the ones that will waste your time if nobody tells you. Each is a styled
`<button>` with no `onClick`.

| View | Controls |
|------|----------|
| Settings → Project | **Create API key**, **Manage Integrations**, per-row **Reveal** and **Delete** |
| Settings → Billing | **Upgrade plan**, **Add method**, per-invoice **Download** |
| Settings → Team | **New User**, per-row **Edit** and **Delete** |
| Webhooks | **Create Webhook**, and the rows carry `.row-click` styling without an open handler, so they look clickable and are not. The per-row URL **copy** is real. |
| Quickstart | **Open docs**, **Migrating from Alchemy / Infura**, **Rotate** (key), **Compare plans** |
| JSON-RPC, All APIs, Unified APIs, Chains | Doc links and secondary actions in the toolbars |

`NavRow` rows in Settings → *Manage Project* (**Rename**, **Archive**) are also inert,
they take an `onClick` prop that isn't passed yet.

## Real: ships as-is

Don't rebuild these; they already work against `src/data/`.

- **Navigation and routing**, sidebar, breadcrumbs, browser Back/Forward, and deep links
  (`/analytics?endpoint=…`) in [`App.tsx`](../src/App.tsx). Real URL syncing.
- **Command palette** (`⌘K`), real fuzzy search across endpoints, chains, and pages, with
  full keyboard handling. Navigates for real.
- **Every filter, sort, search, and paging control**. All APIs, JSON-RPC, Chains,
  Unified, Analytics' endpoint table. Real `useMemo` logic; pagination genuinely slices.
- **Theme**, real, persisted in `localStorage`, respects the system preference.
- **Site banner dismissal**, real, persisted in `localStorage` under an id you bump when
  the copy changes.
- **All copy-to-clipboard**, real `navigator.clipboard`. Note Overview's AI-prompt pane
  renders the API key masked but copies the live one; that's deliberate.
- **Charts**, real Recharts rendering, real tooltips and crosshairs, over mock series.
- **Drawers, modals, popovers**, open/close, Escape, backdrop dismissal, focus and
  keyboard behaviour are all real.
- **Every visual state**, hover, focus-visible, disabled, loading, empty. Empty states
  are already in place for when a fetch returns nothing.

---

## Wiring order I'd suggest

1. **`data/analytics.ts`** first. It feeds the largest surface, and its `Snapshot` type
   is the biggest contract to agree with your backend.
2. **`data/mock.ts` lists**, keys, webhooks, team, invoices, notifications. Each is a
   plain array today; each becomes a fetch. The views need no edits.
3. **The three staged request buttons**. Overview, Quickstart, API Tester. All three
   share one shape: set running, await, set response.
4. **The inert controls**, these are new work, not integration. Scope them separately.

See *For the engineer implementing this* in
[`component-library-handoff.md`](component-library-handoff.md) for the repo map, the
CSS file map, and the mock → API swap example.
