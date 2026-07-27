import { useState } from 'react';
import { Segmented } from '../../components/Segmented';
import { MethodBadge } from '../../components/ui';
import { Band, BandHead } from './Band';
import { ProviderMesh, RouteRace, BillingSplit } from '../graphics/ProofGraphics';
import { overview } from '../content/home';

/**
 * The four claims used to be four identical cards. Each one now gets its own
 * demonstration and its own side of the page: the argument is made by the
 * visual, and the copy annotates it.
 */

/** The endpoint surface, browsable — the proof for "3,000+ APIs". */
function Explorer() {
  const [tab, setTab] = useState(overview.tabs[0]);

  return (
    <div className="pg pg-explorer">
      <div className="lp-explorer-tabs">
        <Segmented
          variant="tab"
          label="API categories"
          value={tab}
          onChange={setTab}
          options={overview.tabs.map((t) => ({ value: t, label: t }))}
        />
      </div>

      {tab === overview.tabs[0] ? (
        overview.endpoints.map((endpoint) => (
          <div key={endpoint.path} className="lp-endpoint">
            <MethodBadge method={endpoint.method} />
            <span>
              <span className="lp-endpoint-path">{endpoint.path}</span>
              <span className="lp-endpoint-desc">{endpoint.title}</span>
            </span>
          </div>
        ))
      ) : (
        <div className="lp-endpoint">
          <MethodBadge method="GET" />
          <span>
            <span className="lp-endpoint-path">uni/v1/{tab.toLowerCase().replace(/\W+/g, '-')}/…</span>
            <span className="lp-endpoint-desc">
              Browse the full {tab.toLowerCase()} surface in the endpoint reference.
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

const visuals: Record<string, () => React.ReactElement> = {
  apis: Explorer,
  orchestrated: ProviderMesh,
  routing: RouteRace,
  billing: BillingSplit,
};

export function Overview() {
  return (
    <Band className="lp-overview">
      <BandHead
        eyebrow={overview.eyebrow}
        wide
        title={
          <>
            {overview.title[0]} <span className="dim">{overview.title[1]}</span>
          </>
        }
        lede={overview.body}
      />

      <div className="lp-proofs">
        {overview.features.map((feature, i) => {
          const Visual = visuals[feature.id];
          // Every landing class stays `lp-`-prefixed: the dashboard's global
          // stylesheet is loaded too, and it already owns names like `.flip`.
          return (
            <section key={feature.id} className={`lp-proof ${i % 2 ? 'lp-flip' : ''}`.trim()}>
              <div className="lp-proof-copy" data-reveal>
                <span className="lp-proof-index">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="lp-proof-title">{feature.title}</h3>
                <p className="lp-proof-body">{feature.body}</p>
                <button className="btn btn-lg lp-proof-cta">{feature.cta}</button>
              </div>
              <div className="lp-proof-visual" data-reveal>
                <Visual />
              </div>
            </section>
          );
        })}
      </div>
    </Band>
  );
}
