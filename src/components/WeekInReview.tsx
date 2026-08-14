import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Area, AreaChart, Tooltip, XAxis } from 'recharts';
import { Icon } from './Icons';
import {
  Badge, BarList, CopyButton, Delta, Figure, Modal, ModalFoot, Num, Panel, Spec,
  Sparkline, Stepper,
} from './ui';
import { ChartFrame, ChartTooltip, chartAxis, chartAxisLine, chartCursor } from './ui/Chart';
import { weekInReview as w } from '../data/mock';
import type { WeekPageId } from '../data/mock';

/* ---------------- formatting ---------------- */

const int = (n: number) => Math.round(n).toLocaleString();
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const money2 = (n: number) => `$${n.toFixed(2)}`;

const requestsDelta = ((w.requests - w.requestsPrior) / w.requestsPrior) * 100;

/* Only the vendors that publish an entry tier can be summed. The ones that do
   not are counted separately and named, rather than quietly dropped or given an
   invented number: "won't quote you without a call" is part of the point. */
const publishedFloors = w.cost.planFloors.filter((p) => p.monthly !== null);
const floorsTotal = publishedFloors.reduce((sum, p) => sum + (p.monthly ?? 0), 0);
const maxFloor = Math.max(...publishedFloors.map((p) => p.monthly ?? 0));
const quoteOnly = w.cost.planFloors.length - publishedFloors.length;

/** The seven days, labelled, for the deck's opening chart. */
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const days = w.series.map((requests, i) => ({ label: dayNames[i], requests }));

/* ---------------- rail card ---------------- */

/**
 * The rail teaser. Three figures and a way in. The argument itself lives in
 * the deck, and a card that tries to make it here is just a smaller deck.
 */
export function WeekInReviewCard({ onOpen }: { onOpen: () => void }) {
  return (
    <Panel className="wir-card">
      <header className="wir-card-head">
        <span className="eyebrow">{w.label}</span>
        <span className="mono dim wir-card-range">{w.range}</span>
      </header>

      <Figure value={int(w.requests)} unit="requests routed" />

      <div className="wir-card-trend">
        <Delta pct={requestsDelta} good since="prior week" />
        <Sparkline points={[...w.series]} width={72} height={20} className="wir-card-spark" />
      </div>

      <Spec
        rows={[
          { label: <><Icon.Route size={13} className="dim" /> Failover saves</>, value: int(w.failover.rescued) },
          { label: <><Icon.Receipt size={13} className="dim" /> Contracts avoided</>, value: String(w.providers.contractsAvoided) },
          { label: <><Icon.Coin size={13} className="dim" /> Minimums avoided</>, value: `${money(floorsTotal)} /mo` },
        ]}
      />

      <button className="btn dark wir-card-cta" onClick={onOpen}>
        Open the week <Icon.Chevron size={13} />
      </button>
    </Panel>
  );
}

/* ---------------- deck pages ---------------- */

const pages: { id: WeekPageId; label: string }[] = [
  { id: 'week',      label: 'The week' },
  { id: 'failover',  label: 'Failover' },
  { id: 'providers', label: 'Providers' },
  { id: 'cost',      label: 'Cost' },
  { id: 'work',      label: 'Work' },
  { id: 'recap',     label: 'Recap' },
];

/**
 * One page of the deck: a single figure carrying the headline, a sentence that
 * says what it means, and the working underneath it. Every page is the same
 * shape so the numbers are read rather than the layout.
 */
function Page({
  eyebrow, figure, unit, lede, children,
}: {
  eyebrow: string;
  figure: ReactNode;
  unit: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="wir-page">
      <div className="wir-page-lead">
        <span className="eyebrow">{eyebrow}</span>
        <Figure value={figure} unit={unit} />
        <p className="wir-lede">{lede}</p>
      </div>
      <div className="wir-page-detail">{children}</div>
    </div>
  );
}

/**
 * One cell of the recap mosaic: an index mark, a figure at display size, its
 * label, and one line saying what the figure cost or replaced.
 *
 * Deck-local on purpose, not a `components/ui` primitive. It only makes sense
 * inside the recap's grid, and the system already has `Figure` and `StatTiles`
 * for the general cases; a third exported tile would be the parallel component
 * the handoff warns about.
 *
 * `accent` fills one cell in the brand blue. Exactly one, and it is the money:
 * blue is the Uniblock path, so the cell that says what the single contract
 * saved is the only one entitled to it.
 */
function RecapCell({
  mark, label, value, note, accent, className = '', children,
}: {
  mark: string;
  label: string;
  value: string;
  note: string;
  accent?: boolean;
  /** `is-tall` spans both rows; `is-wide` spans both columns. */
  className?: string;
  /** The cell's own device: a meter, a unit chart, a supporting line. */
  children?: ReactNode;
}) {
  return (
    <li className={`wir-cell ${accent ? 'is-accent' : ''} ${className}`.replace(/\s+/g, ' ').trim()}>
      <span className="pixel wir-cell-num">{value}</span>
      {/* The index mark rides on the label rather than taking its own line.
          Four cells each spending a full line on a two-digit mark was 66px of
          the overflow that pushed the last cell off the bottom. */}
      <span className="wir-cell-label">
        <span className="mono wir-cell-mark">{mark}</span>
        {label}
      </span>
      {children && <div className="wir-cell-device">{children}</div>}
      <span className="wir-cell-note">{note}</span>
    </li>
  );
}

/* ============================================================
   Recap graphics
   ------------------------------------------------------------
   Three data drawings, deck-local. Every one of them is the real series or the
   real count, drawn rather than printed: the recap is the page people screenshot,
   and four numerals in four boxes is a form, not a poster.

   They are hand-built SVG and divs on purpose. The Phosphor-only rule governs
   *icons*, pictures that stand for a concept, and none of these are that. They
   are the same class of thing as `Sparkline` in `ui/Data.tsx`, which the system
   already hand-draws for exactly this reason.
   ============================================================ */

/** One square per this many requests. Tuned so the busiest day is ~14 tall. */
const REQUESTS_PER_SQUARE = 5000;

/**
 * The week as a field of squares, one column per day, one square per 5,000
 * requests. The area *is* the total: it is a unit chart, not a bar chart drawn
 * with square caps, so counting it gets you back to the headline figure.
 */
function WeekField() {
  const units = w.series.map((v) => Math.max(1, Math.round(v / REQUESTS_PER_SQUARE)));
  const peakUnits = Math.max(...units);
  const peakDay = units.indexOf(peakUnits);
  return (
    <div className="wf" role="img" aria-label={`${int(w.requests)} requests across seven days`}>
      <div className="wf-cols">
        {units.map((n, i) => (
          <div className={`wf-col ${i === peakDay ? 'is-peak' : ''}`.trim()} key={i}>
            <div className="wf-stack">
              {Array.from({ length: n }, (_, j) => (
                <span key={j} className="wf-sq" />
              ))}
            </div>
            <span className="wf-day mono">{dayNames[i][0]}</span>
          </div>
        ))}
      </div>
      {/* The peak reads in the footer, not on a callout floating over the
          columns. Above the field it reserved a band of height across all seven
          days to label one of them, and six days of empty air is a poor trade
          for one number. The solid column and the blue letter already point at
          it; the footer just has to name it. */}
      <div className="wf-foot">
        <span className="wf-key mono">
          <span className="wf-key-sq" aria-hidden /> = {int(REQUESTS_PER_SQUARE)}
        </span>
        <span className="wf-peak mono">
          peak {dayNames[peakDay]} {int(w.series[peakDay])}
        </span>
      </div>
    </div>
  );
}

/**
 * One contract fanning out to seven providers.
 *
 * The product's whole argument as a drawing: a single filled mark on the left,
 * seven outlined ones on the right, hairlines between. It says "one, not seven"
 * before any of the words do.
 */
/**
 * Laid out in HTML with only the connectors in SVG.
 *
 * The whole thing used to be one SVG, labels included. That is why it could not
 * fill its cell: scaling the drawing to the container scales `<text>` with it,
 * so the provider names would have grown straight off the type scale. The
 * viewBox therefore had to stay wider than the drawing, which left a band of
 * dead space on the right and made it read as pinned to the left edge.
 *
 * Now the hub and the labels are real elements on real tokens, and the SVG
 * carries the wiring alone: it stretches on both axes with
 * `preserveAspectRatio="none"`, and `vector-effect` keeps the hairlines 1px
 * while it does.
 */
function ProviderFan() {
  const names = w.providers.names;
  const n = names.length;
  return (
    <div
      className="fan"
      role="img"
      aria-label={`One contract reaching ${n} providers: ${names.join(', ')}`}
    >
      <div className="fan-hub-wrap">
        <span className="fan-hub" />
        <span className="fan-hub-label">You</span>
      </div>

      <svg className="fan-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {names.map((name, i) => (
          <path
            key={name}
            className="fan-link"
            vectorEffect="non-scaling-stroke"
            // Out flat, turn once, in flat. An orthogonal route reads as
            // wiring; a curve would read as decoration. The turn sits at 45%
            // so the runs in and out are visibly different lengths, which is
            // what stops seven parallel lines looking like a comb.
            d={`M0 50 H45 V${((i + 0.5) / n) * 100} H100`}
          />
        ))}
      </svg>

      {/* `space-around` puts each row's centre at (i + 0.5) / n of the height,
          which is exactly where the connectors land. */}
      <ul className="fan-nodes">
        {names.map((name) => (
          <li className="fan-node-row" key={name}>
            <span className="fan-node" />
            <span className="fan-name mono">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The week as one unbroken line, with a tick under each provider incident.
 *
 * The point of the zero is not that nothing happened, it is that three things
 * happened and the line held. A bare "0" cannot say that; this can.
 */
function FailoverBars() {
  // The rule line and three ticks this replaced was a hairline in a cell 240px
  // wide: too thin to carry its own space, and it could only say *that*
  // something happened. These are the providers that actually wobbled and what
  // each one cost in rerouted requests, which is the same story with the
  // magnitudes left in.
  const rows = w.failover.byProvider;
  const max = rows[0].count;
  return (
    <ul className="fbars" aria-label="Requests rerouted, by provider">
      {rows.map((p) => (
        <li className="fbar" key={p.name}>
          <span className="fbar-name mono">{p.name}</span>
          <span className="fbar-track">
            <span className="fbar-fill" style={{ '--w': `${(p.count / max) * 100}%` } as CSSProperties} />
          </span>
          <span className="fbar-val mono">{int(p.count)}</span>
        </li>
      ))}
    </ul>
  );
}

function PageBody({ page }: { page: WeekPageId }) {
  switch (page) {
    case 'week':
      return (
        <Page
          eyebrow={`${w.label} · ${w.range}`}
          figure={<Num value={w.requests} format={int} />}
          unit="requests routed"
          lede={<>Across <strong>{w.chains} chains</strong>, at a {w.successRate}% success rate. Every one of them went to whichever provider was healthiest and closest at the moment it arrived.</>}
        >
          <ChartFrame height={168}>
            <AreaChart data={days} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="wirFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ub-blue)" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="var(--ub-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" {...chartAxis} axisLine={chartAxisLine} tickMargin={8} />
              <Tooltip
                cursor={chartCursor}
                content={<ChartTooltip valueFormatter={(v) => int(Number(v))} />}
              />
              <Area
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="var(--ub-blue)"
                strokeWidth={2}
                fill="url(#wirFill)"
              />
            </AreaChart>
          </ChartFrame>
          <Spec
            rows={[
              { label: 'vs prior week', value: <Delta pct={requestsDelta} good /> },
              { label: 'Chains touched', value: <span className="mono">{w.chains}</span> },
              { label: 'Success rate', value: <span className="mono">{w.successRate}%</span> },
              { label: 'Median latency', value: <span className="mono">{w.p50} ms</span> },
            ]}
          />
        </Page>
      );

    case 'failover':
      return (
        <Page
          eyebrow="Failover"
          figure={<Num value={w.failover.triggers} format={int} />}
          unit="times failover fired"
          lede={<>Three providers wobbled this week. <strong>{int(w.failover.rescued)} requests</strong> were rerouted mid-flight and answered anyway. None of them reached your error handler.</>}
        >
          <BarList
            items={w.failover.byProvider.map((p) => ({
              id: p.name,
              label: p.name,
              share: (p.count / w.failover.byProvider[0].count) * 100,
              value: int(p.count),
            }))}
          />
          <Spec
            rows={[
              { label: 'Provider incidents absorbed', value: <span className="mono">{w.failover.incidents}</span> },
              {
                label: 'Longest degradation',
                value: <span className="mono">{w.failover.worst.provider} · {w.failover.worst.minutes} min</span>,
              },
              { label: 'Days since a dropped request', value: <span className="mono">{w.failover.streakDays}</span> },
            ]}
          />
        </Page>
      );

    case 'providers':
      return (
        <Page
          eyebrow="Providers"
          figure={<Num value={w.providers.used} format={String} />}
          unit="providers routed through"
          lede={<>You hold <strong>one</strong> contract. Reaching these seven directly would have meant <strong>{w.providers.contractsAvoided} more</strong>: separate keys, separate invoices, separate rate limits to reason about.</>}
        >
          <div className="wir-chips">
            {w.providers.names.map((n) => <Badge key={n}>{n}</Badge>)}
          </div>
          <BarList
            items={w.providers.split.map((p) => ({
              id: p.name,
              label: p.name,
              share: p.pct,
              value: `${p.pct}%`,
            }))}
          />
          <Spec
            rows={[
              { label: 'Contracts signed', value: <span className="mono">1</span> },
              { label: 'Contracts avoided', value: <span className="mono">{w.providers.contractsAvoided}</span> },
              { label: 'API keys to rotate', value: <span className="mono">1</span> },
            ]}
          />
        </Page>
      );

    case 'cost':
      return (
        <Page
          eyebrow="Cost"
          figure={<Num value={floorsTotal} format={money} />}
          unit="a month in minimums you don't carry"
          lede={<>Reaching these seven directly starts at seven monthly minimums, owed before a single request is served. <strong>{quoteOnly} of them won't publish a price at all.</strong> You carry one contract.</>}
        >
          <BarList
            items={w.cost.planFloors
              .filter((p) => p.monthly !== null)
              .map((p) => ({
                id: p.name,
                label: p.name,
                share: (p.monthly! / maxFloor) * 100,
                value: `${money(p.monthly!)} /mo`,
                color: 'var(--ub-text-3)',
              }))}
          />
          <Spec
            rows={[
              ...w.cost.planFloors
                .filter((p) => p.monthly === null)
                .map((p) => ({
                  label: p.name,
                  // A placeholder, not a price. This vendor costs a sales call
                  // before it costs money, which is the argument, not a gap.
                  value: <span className="mono dim">— quote only</span>,
                })),
              { label: 'You spent this week', value: <span className="mono">{money(w.cost.spendWeek)}</span> },
              { label: 'Your effective rate', value: <span className="mono">{money2(w.cost.perMillion)} / M</span> },
              { label: 'Contracts you hold', value: <span className="mono">1</span> },
            ]}
          />
        </Page>
      );

    case 'work':
      return (
        <Page
          eyebrow="Work you didn't do"
          figure={<Num value={w.failover.incidents} format={String} />}
          unit="provider incidents absorbed"
          lede={<>{w.failover.worst.provider} went bad for <strong>{w.failover.worst.minutes} minutes</strong> on {w.failover.worst.chain}. Routing moved around it while it was happening, and you were paged for none of it.</>}
        >
          <Spec
            rows={[
              { label: 'Times you were paged', value: <span className="mono">0</span> },
              { label: 'Integrations not written', value: <span className="mono">{w.work.integrationsNotWritten}</span> },
              { label: 'Invoices to reconcile', value: <span className="mono">{w.work.invoices}</span> },
              { label: 'API keys to rotate', value: <span className="mono">{w.work.keysToRotate}</span> },
              { label: 'Days since a dropped request', value: <span className="mono">{w.failover.streakDays}</span> },
              { label: 'Median request', value: <span className="mono">{w.p50} ms</span> },
              /* Its own row rather than a trailing clause on the one above:
                 `.spec` is `1fr auto`, so one long value sizes the whole value
                 column and squeezes every label into two lines. */
              {
                label: 'vs the slowest healthy provider',
                value: <span className="mono">{w.work.latencySavedMs} ms faster</span>,
              },
            ]}
          />
        </Page>
      );

    case 'recap':
      return (
        <div className="wir-recap">
          {/* The headline number gets the whole width and the dither behind it.
              The five rows this replaced were all set at the same size, which
              made the week's biggest fact sit level with its smallest, and gave
              the last page of the deck nothing to land on. */}
          <section className="wir-recap-hero marks-4">
            <div className="wir-recap-hero-inner">
              <div className="wir-recap-hero-copy">
                <span className="eyebrow">{w.label} · {w.range}</span>
                <span className="pixel wir-recap-hero-num">
                  <Num value={w.requests} format={int} />
                </span>
                <span className="wir-recap-hero-unit">
                  requests routed across {w.chains} chains, at {w.successRate}% success
                </span>
              </div>
              {/* The figure and the shape of the week it came from, side by
                  side. The dither used to fill this half with texture; a unit
                  chart of the same data is the better use of the space. */}
              <WeekField />
            </div>
          </section>

          {/* Three cells, each carrying a drawing rather than a fourth numeral
              in a fourth box. The row is one blue block and two graphite ones,
              so the money still leads without needing to be bigger than
              everything else as well. */}
          <ul className="wir-recap-grid">
            <RecapCell
              mark="01"
              label="A month in minimums"
              value={money(floorsTotal)}
              note="Seven vendors, seven monthly minimums, owed before a request is served."
              accent
            >
              {/* A price ladder, with the prices on it. The dashed last bar is
                  the vendor that publishes none: it cannot be drawn to scale
                  because it does not have a number, and a "?" is the honest
                  height for an unknown. */}
              <ul className="floors" aria-label="Published entry-tier prices">
                {w.cost.planFloors.map((p) => (
                  <li className="floor" key={p.name}>
                    <span className="floor-amt mono">{p.monthly === null ? '?' : `$${p.monthly}`}</span>
                    <span
                      className={`floor-bar ${p.monthly === null ? 'is-unknown' : ''}`.trim()}
                      style={{ '--h': `${p.monthly === null ? 100 : (p.monthly / maxFloor) * 100}%` } as CSSProperties}
                    />
                  </li>
                ))}
              </ul>
            </RecapCell>

            <RecapCell
              mark="02"
              label="Contracts you don't hold"
              value={String(w.providers.contractsAvoided)}
              note={`${w.providers.used} providers reached on the one you signed.`}
            >
              <ProviderFan />
            </RecapCell>

            <RecapCell
              mark="03"
              label="Times you were paged"
              value="0"
              note={`${int(w.failover.rescued)} requests rerouted through ${w.failover.incidents} incidents.`}
            >
              <FailoverBars />
            </RecapCell>
          </ul>
        </div>
      );
  }
}

/* ---------------- deck ---------------- */

const shareText = [
  `Uniblock · ${w.label} (${w.range})`,
  `${int(w.requests)} requests routed across ${w.chains} chains`,
  `${int(w.failover.rescued)} requests rescued by failover`,
  `${w.providers.used} providers reached on 1 contract`,
  `${money(floorsTotal)}/mo in plan minimums not carried · 1 contract, not ${w.providers.used}`,
  `${w.failover.incidents} provider incidents absorbed · paged 0 times`,
].join('\n');

export function WeekInReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  /** Which way the deck last moved, so pages enter from the side you came from. */
  const [back, setBack] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const [stageH, setStageH] = useState<number>();

  function go(next: number) {
    const clamped = Math.min(pages.length - 1, Math.max(0, next));
    if (clamped === idx) return;
    setBack(clamped < idx);
    setIdx(clamped);
  }

  /* Reset on the open transition, during render rather than in an effect: the
     deck should be on page one the moment it mounts, not one paint later. */
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setIdx(0); setBack(false); setStageH(undefined); }
  }

  /* Escape and the backdrop belong to `Modal`; the arrows are the deck's own. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIdx((i) => (i < pages.length - 1 ? (setBack(false), i + 1) : i));
      if (e.key === 'ArrowLeft') setIdx((i) => (i > 0 ? (setBack(true), i - 1) : i));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  /* Pages are different heights. Measuring the incoming one and animating the
     stage to it turns the swap into a movement instead of the modal snapping
     to a new size under the pointer. */
  useLayoutEffect(() => {
    if (!open) return;
    const el = stage.current;
    if (el) setStageH(el.offsetHeight);
  }, [open, idx]);

  if (!open) return null;

  const last = idx === pages.length - 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="wir-modal"
      title="Week in review"
      sub={`What Uniblock did for you between ${w.range}.`}
      /* The deck is browsable, not a wizard: every page is already true, so
         the markers jump rather than gate. */
      nav={<Stepper steps={pages} current={idx} onSelect={go} label="Pages" />}
      foot={
        <ModalFoot summary={<span className="mono">{idx + 1} / {pages.length}</span>}>
          {last && (
            <span className="wir-share">
              <CopyButton value={shareText} copyKey="wir" label="Copy summary" copiedLabel="Copied" size={13} />
            </span>
          )}
          <button className="btn" onClick={() => go(idx - 1)} disabled={idx === 0}>
            Back
          </button>
          <button className="btn primary" onClick={() => (last ? onClose() : go(idx + 1))}>
            {last ? 'Done' : 'Next'}
          </button>
        </ModalFoot>
      }
    >
      <div className="swap-stage wir-stage" style={stageH ? { height: stageH } : undefined}>
        {/* Keyed so each page remounts: the figure counts up, the bars grow,
            and the entrance replays every time you arrive. */}
        <div className={`swap-in ${back ? 'is-back' : ''}`} key={pages[idx].id} ref={stage}>
          <PageBody page={pages[idx].id} />
        </div>
      </div>
    </Modal>
  );
}
