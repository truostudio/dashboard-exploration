import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
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
const hours = (n: number) => `${n} h`;

const requestsDelta = ((w.requests - w.requestsPrior) / w.requestsPrior) * 100;

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
          { label: <><Icon.Coin size={13} className="dim" /> Saved this week</>, value: money(w.cost.savedWeek) },
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
  { id: 'time',      label: 'Time' },
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

    case 'cost': {
      const cheaper = Math.round((1 - w.cost.uniblockSpend / w.cost.directSpend) * 100);
      return (
        <Page
          eyebrow="Cost"
          figure={<Num value={w.cost.savedWeek} format={money} />}
          unit="saved this week"
          lede={<>The same seven providers, bought directly at the volumes you used, price out at <strong>{money(w.cost.directSpend)}</strong>. You spent {money(w.cost.uniblockSpend)}.</>}
        >
          <BarList
            items={[
              {
                id: 'direct',
                label: 'Direct plans',
                share: 100,
                value: money(w.cost.directSpend),
                color: 'var(--ub-text-3)',
              },
              {
                id: 'uniblock',
                label: 'Uniblock',
                share: (w.cost.uniblockSpend / w.cost.directSpend) * 100,
                value: money(w.cost.uniblockSpend),
              },
            ]}
          />
          <Spec
            rows={[
              { label: 'Effective rate', value: <span className="mono">{money2(w.cost.perMillion)} / M</span> },
              { label: 'Direct-plan rate', value: <span className="mono">{money2(w.cost.perMillionDirect)} / M</span> },
              { label: 'Cheaper by', value: <span className="mono">{cheaper}%</span> },
              { label: 'Saved quarter to date', value: <span className="mono">{money(w.cost.savedQtd)}</span> },
            ]}
          />
        </Page>
      );
    }

    case 'time':
      return (
        <Page
          eyebrow="Time"
          figure={<Num value={w.time.hoursSaved} format={String} />}
          unit="engineer-hours saved"
          lede={<>Integrations not written, pages not answered, invoices not reconciled. Routing also shaved <strong>{w.time.latencySavedMs} ms</strong> off the median request, about {w.time.userHoursSaved} hours of waiting your users never did.</>}
        >
          <BarList
            items={w.time.breakdown.map((b) => ({
              id: b.label,
              label: b.label,
              share: (b.hours / w.time.hoursSaved) * 100,
              value: hours(b.hours),
            }))}
          />
          <Spec
            rows={[
              { label: 'Latency saved per request', value: <span className="mono">{w.time.latencySavedMs} ms</span> },
              { label: 'Aggregate user wait removed', value: <span className="mono">{w.time.userHoursSaved} h</span> },
              { label: 'Incidents you were paged for', value: <span className="mono">0</span> },
            ]}
          />
        </Page>
      );

    case 'recap':
      return (
        <div className="wir-recap">
          <div className="wir-recap-head">
            <span className="eyebrow">{w.label} · {w.range}</span>
            <h3 className="wir-recap-title">Five numbers from the week.</h3>
          </div>
          {/* A ledger rather than a tile wall: five rows on one baseline are
              comparable, five boxes are just five boxes. */}
          <ul className="wir-recap-list">
            {[
              { k: 'Requests routed',      v: int(w.requests) },
              { k: 'Requests saved by failover', v: int(w.failover.rescued) },
              { k: 'Provider contracts avoided', v: String(w.providers.contractsAvoided) },
              { k: 'Saved this week',      v: money(w.cost.savedWeek) },
              { k: 'Engineer-hours saved', v: String(w.time.hoursSaved) },
            ].map((s) => (
              <li key={s.k} className="wir-recap-row">
                <span className="wir-recap-label">{s.k}</span>
                <Figure size="md" value={s.v} />
              </li>
            ))}
          </ul>
          <p className="wir-recap-foot dim">
            Same week next Monday. Nothing here is an estimate. Every figure is
            counted off the requests you actually sent.
          </p>
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
  `${money(w.cost.savedWeek)} saved · ${w.time.hoursSaved} engineer-hours saved`,
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
      <div className="wir-stage" style={stageH ? { height: stageH } : undefined}>
        {/* Keyed so each page remounts: the figure counts up, the bars grow,
            and the entrance replays every time you arrive. */}
        <div className={`wir-stage-inner ${back ? 'is-back' : ''}`} key={pages[idx].id} ref={stage}>
          <PageBody page={pages[idx].id} />
        </div>
      </div>
    </Modal>
  );
}
