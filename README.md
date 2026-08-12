# Uniblock dashboard

A working redesign of the Uniblock dashboard, built in code rather than in a design tool
so what you see is what ships. React + Vite + plain CSS. No Tailwind, no CSS-in-JS, no
third-party component library, the design system is hand-built and lives in this repo.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typechecks, then builds
npm run lint
```

## Start here

| If you are… | Read |
|-------------|------|
| **implementing this for real** | [`public/what-is-real.md`](public/what-is-real.md) **first**, which interactions actually work, which are simulated, and which controls are inert. Then [`public/component-library-handoff.md`](public/component-library-handoff.md), tokens, every primitive with its props, where each component's CSS lives, and how to swap the mock data for a real API. Written to be pasted into an LLM whole. |
| **an agent working in this repo** | [`CLAUDE.md`](CLAUDE.md), the short version of the rules, plus what to check before you finish. |
| **looking for a component** | Run the app and open **`/components`**. Every primitive, live, with copyable snippets. It is the source of truth; the handoff doc mirrors it. |
| **picking up the marketing site** | [`HANDOFF.md`](HANDOFF.md), the landing pages at `/landing-page-<slug>`. |

## Layout

```
src/
  index.css          tokens + foundations (both themes)
  App.css            component and view styles
  components/ui/     the primitives: one barrel export
  components/        app composites: Sidebar, Topbar, Notifications, …
  views/             one file per screen
  data/              all content, and the seam where a real API goes
  landing/           the marketing site
```

## The short version of the rules

Compose from the primitives instead of writing new markup. Colour, space, type, shadow
and motion come from CSS variables, never literals. Everything is square. All chrome is
12px. Icons are Phosphor only, through `Icons.tsx`. Blue means exactly one thing: the
Uniblock path.

The rest, including the reasoning, is in the two documents above.
