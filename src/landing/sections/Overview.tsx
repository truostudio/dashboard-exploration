import { useState } from 'react';
import { Segmented } from '../../components/Segmented';
import { MethodBadge } from '../../components/ui';
import { Band, BandHead, SectionRule } from './Band';
import { Win } from '../graphics/Window';
import { LogStream } from '../graphics/LogStream';
import { ProviderMesh, RouteRace, BillingSplit } from '../graphics/ProofGraphics';
import { overview } from '../content/home';

/**
 * Four claims, each with a demonstration beside it.
 *
 * There used to be a focus that advanced on a timer, lighting one block's
 * border and label blue in turn. From the outside that reads as things going
 * blue at random, a viewer has no idea what "focused" means or why it moved.
 * It is gone. Blue now marks only what it marks everywhere else on the page:
 * the Uniblock path, the provider that won, the single invoice, the live tail.
 *
 * Pairs wrap in `.lp-pair`. Desktop column order is DOM order; mobile always
 * re-stacks the note above the graphic regardless of how the pair is written.
 */

const FEATURES = Object.fromEntries(overview.features.map((f) => [f.id, f]));

type Tab = (typeof overview.tabs)[number];

/** The endpoint surface, browsable, the proof for "3,000+ APIs". */
function Explorer() {
  const [tab, setTab] = useState<Tab>(overview.tabs[0]);

  return (
    <>
      <div className="lp-explorer-tabs">
        <Segmented
          variant="tab"
          label="API categories"
          value={tab}
          onChange={setTab}
          options={overview.tabs.map((t) => ({ value: t, label: t }))}
        />
      </div>

      {overview.endpoints[tab].map((endpoint) => (
        <div key={endpoint.path} className="lp-endpoint">
          <MethodBadge method={endpoint.method} />
          <span>
            <span className="lp-endpoint-path">{endpoint.path}</span>
            <span className="lp-endpoint-desc">{endpoint.title}</span>
          </span>
        </div>
      ))}
    </>
  );
}

/** A feature's prose, as its own block. */
function Note({ id, w }: { id: string; w: number }) {
  const feature = FEATURES[id];

  return (
    <Win w={w} variant="flat" className="win-note">
      <h3 className="win-note-title">{feature.title}</h3>
      <p className="win-note-body">{feature.body}</p>
      <button className="btn lp-proof-cta">{feature.cta}</button>
    </Win>
  );
}

export function Overview() {
  return (
    <Band className="lp-overview">
      <SectionRule index="04" />
      <BandHead
        wide
        title={
          <>
            {overview.title[0]} <span className="dim">{overview.title[1]}</span>
          </>
        }
        lede={overview.body}
      />

      <div className="lp-blocks lp-workspace" data-reveal>
        <div className="lp-pair">
          <Note id="apis" w={4} />
          <Win
            w={8}
            bare
            title="The endpoint surface"
            caption="Every category resolves to the same request shape and the same response contract."
            label="4 of 3,000+ shown"
            meta="one contract"
          >
            <Explorer />
          </Win>
        </div>

        {/* Graphic first: desktop column order is DOM order. Mobile still
            stacks the note above it. */}
        <div className="lp-pair">
          <Win
            w={7}
            bare
            title="Every provider, health-checked"
            caption="Uniblock polls all 55+ providers continuously. The highlight is that check moving through them."
            label="55+ connected"
            meta="all operational"
          >
            <ProviderMesh cols={7} rows={2} />
          </Win>
          <Note id="orchestrated" w={5} />
        </div>

        <div className="lp-pair">
          <Note id="routing" w={5} />
          <Win
            w={7}
            bare
            title="How a provider is chosen"
            caption="Latency, cost and reliability are scored on every request. The full-strength row is the provider that won this one."
            label="scored per request"
            meta="hedged if the winner slows"
          >
            <RouteRace />
          </Win>
        </div>

        {/* Flipped: graphic left, note right. */}
        <div className="lp-pair">
          <Win
            w={7}
            bare
            title="Five contracts become one"
            caption="The same spend, billed once. Blue is what you actually receive."
            label="5 invoices → 1"
            meta="one relationship"
          >
            <BillingSplit />
          </Win>
          <Note id="billing" w={5} />
        </div>

        {/* Last, and full width. The four claims above are paired blocks; a
            12-wide block between them broke that rhythm and read as a one-off.
            At the end it is a closing statement instead, the four arguments,
            then the traffic they are arguing about. */}
        <Win
          w={12}
          bare
          title="The routing layer, live"
          caption="All four of the above, on real traffic: the request, the chain, the provider that served it, and how long it took."
          label={
            <span className="pg-foot-live">
              <i /> live tail
            </span>
          }
          meta="roughly 1 in 9 requests is hedged"
        >
          <LogStream />
        </Win>
      </div>
    </Band>
  );
}
