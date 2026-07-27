import { Icon } from '../../components/Icons';
import { Band, BandHead } from './Band';
import { CapacityBars, AgentFlow, EventNormalize } from '../graphics/ProofGraphics';
import { fullStack } from '../content/home';

/**
 * Three capabilities as numbered ledger rows rather than three matching cards:
 * an oversized figure, the claim, and a diagram of the thing it describes,
 * separated by hairlines instead of boxed off from each other.
 */
const diagrams: Record<string, () => React.ReactElement> = {
  nodes: CapacityBars,
  mcp: AgentFlow,
  webhooks: EventNormalize,
};

export function FullStack() {
  return (
    <Band className="lp-stack">
      <BandHead eyebrow={fullStack.eyebrow} wide title={fullStack.title} lede={fullStack.body} />

      <div className="lp-ledger">
        {fullStack.cards.map((card, i) => {
          const Diagram = diagrams[card.id];
          return (
            <article key={card.id} className="lp-ledger-row" data-reveal>
              <span className="lp-ledger-num">{String(i + 1).padStart(2, '0')}</span>

              <div className="lp-ledger-copy">
                <span className="eyebrow">{card.eyebrow}</span>
                <h3 className="lp-ledger-title">{card.title}</h3>
                <p className="lp-ledger-body">{card.body}</p>
                <ul className="lp-points">
                  {card.points.map((point) => (
                    <li key={point}>
                      <Icon.Check size={13} /> {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lp-ledger-visual">
                <Diagram />
              </div>
            </article>
          );
        })}
      </div>
    </Band>
  );
}
