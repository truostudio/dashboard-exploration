import { useState } from 'react';
import { Icon } from '../../components/Icons';
import {
  Panel,
  PanelHead,
  TitledPanel,
  Table,
  StatTiles,
  SectionHeader,
} from '../../components/ui';
import { Band, BandHead, SectionRule } from './Band';
import { nodesPage as n } from '../content/nodes';

/** KPI strip — StatTiles inside TitledPanel, same as Overview / Components. */
function NodesStats() {
  return (
    <Band className="lp-nodes-stats">
      <div data-reveal>
        <TitledPanel
          eyebrow="Network"
          title="Hub locations"
          sub={
            <>
              {n.mapNote.replace('looking glass.', '')}
              <a href={n.lookingGlass.href} target="_blank" rel="noreferrer">
                looking glass
              </a>
              .
            </>
          }
          actions={
            <a className="btn" href={n.lookingGlass.href} target="_blank" rel="noreferrer">
              <Icon.External size={14} />
              {n.lookingGlass.label}
            </a>
          }
        >
          <StatTiles
            columns={3}
            tiles={n.stats.map((s) => ({
              id: s.id,
              label: s.label,
              value: s.value,
            }))}
          />
        </TitledPanel>
      </div>
    </Band>
  );
}

function NodesOverview() {
  return (
    <Band>
      <SectionRule index={n.overview.index} />
      <BandHead wide title={n.overview.title} lede={n.overview.body} />
    </Band>
  );
}

/** Shared vs Dedicated — flush Panel + Table. */
function NodesCompare() {
  const columns = n.compare.columns.map((col, i) => ({
    key: String(i),
    header: col,
  }));

  return (
    <Band>
      <SectionHeader lead title={n.compare.title} meta={n.compare.eyebrow} />
      <p className="lp-lede lp-nodes-section-lede" data-reveal>
        {n.compare.lede}
      </p>
      <div data-reveal>
        <Panel flush marks={4}>
          <Table columns={columns} ruled>
            {n.compare.rows.map(([dim, shared, dedicated]) => (
              <tr key={dim}>
                <td className="cell-strong">{dim}</td>
                <td>{shared}</td>
                <td>{dedicated}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
      <p className="dim lp-nodes-footnote" data-reveal>
        {n.compare.bottom}
      </p>
    </Band>
  );
}

function NodesOptions() {
  return (
    <Band>
      <SectionHeader lead title={n.options.title} meta={n.options.eyebrow} />
      <p className="lp-lede lp-nodes-section-lede" data-reveal>
        {n.options.lede}
      </p>
      <div className="lp-nodes-split" data-reveal>
        {n.options.items.map((item) => (
          <Panel key={item.id} marks={4}>
            <PanelHead eyebrow={item.num} title={item.title} sub={item.body} />
          </Panel>
        ))}
      </div>
    </Band>
  );
}

function NodesWhen() {
  return (
    <Band>
      <SectionHeader lead title={n.when.title} meta={n.when.eyebrow} />
      <p className="lp-lede lp-nodes-section-lede" data-reveal>
        {n.when.lede}
      </p>
      <div className="lp-nodes-quad" data-reveal>
        {n.when.items.map((item) => (
          <Panel key={item.id} marks={4}>
            <PanelHead eyebrow={item.num} title={item.title} sub={item.body} />
          </Panel>
        ))}
      </div>
    </Band>
  );
}

function NodesAudience() {
  return (
    <Band>
      <SectionHeader lead title={n.audience.title} meta={n.audience.eyebrow} />
      <div data-reveal>
        <TitledPanel title="Profiles" marks={4}>
          <ul className="lp-points">
            {n.audience.items.map((item) => (
              <li key={item}>
                <Icon.Check size={13} /> {item}
              </li>
            ))}
          </ul>
        </TitledPanel>
      </div>
    </Band>
  );
}

function NodesSteps() {
  return (
    <Band>
      <SectionHeader lead title={n.steps.title} meta={n.steps.eyebrow} />
      <div className="lp-nodes-quad" data-reveal>
        {n.steps.items.map((item) => (
          <Panel key={item.id} marks={4}>
            <PanelHead eyebrow={item.num} title={item.title} sub={item.body} />
          </Panel>
        ))}
      </div>
    </Band>
  );
}

function NodesCapabilities() {
  return (
    <Band>
      <BandHead wide title={n.capabilities.lede} />
      <div className="lp-nodes-split" data-reveal>
        {n.capabilities.items.map((item) => (
          <Panel key={item.id} marks={4}>
            <PanelHead eyebrow={item.num} title={item.title} sub={item.body} />
          </Panel>
        ))}
      </div>
    </Band>
  );
}

function NodesCustom() {
  return (
    <Band>
      <div data-reveal>
        <TitledPanel
          eyebrow="Custom builds"
          title={n.custom.title}
          sub={n.custom.body}
          actions={
            <a className="btn primary" href={n.custom.ctaHref} target="_blank" rel="noreferrer">
              {n.custom.cta}
            </a>
          }
          marks={4}
        >
          <p className="dim">{n.custom.note}</p>
        </TitledPanel>
      </div>
    </Band>
  );
}

function NodesFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Band className="lp-faq-band">
      <SectionRule index={n.faq.index} />
      <BandHead title={n.faq.title} />
      <div className="lp-faq" data-reveal>
        {n.faq.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="lp-faq-item">
              <button
                className="lp-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="lp-faq-num">{String(i + 1).padStart(2, '0')}</span>
                <span>{item.q}</span>
                <Icon.ChevronDown size={14} className="lp-faq-mark" />
              </button>
              <div className={`lp-faq-a-wrap ${isOpen ? 'open' : ''}`.trim()}>
                <div className="lp-faq-a-inner">
                  <p className="lp-faq-a">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Band>
  );
}

/** Nodes middle bands — compose from the component library, not one-off chrome. */
export function NodesContent() {
  return (
    <>
      <NodesStats />
      <NodesOverview />
      <NodesCompare />
      <NodesOptions />
      <NodesWhen />
      <NodesAudience />
      <NodesSteps />
      <NodesCapabilities />
      <NodesCustom />
      <NodesFaq />
    </>
  );
}
