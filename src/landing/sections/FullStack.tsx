import { Icon } from '../../components/Icons';
import { Band, BandHead, SectionRule } from './Band';
import { Win } from '../graphics/Window';
import { CapacityBars, AgentFlow, EventNormalize } from '../graphics/ProofGraphics';
import { fullStack } from '../content/home';

const diagrams: Record<string, () => React.ReactElement> = {
  nodes: CapacityBars,
  mcp: AgentFlow,
  webhooks: EventNormalize,
};

/** What each diagram is showing, since a diagram alone is naked. */
const CAPTIONS: Record<string, { title: string; caption: string; label: string }> = {
  nodes: {
    title: 'Dedicated against shared capacity',
    caption: 'The same workload on shared infrastructure and on nodes reserved for you.',
    label: 'p99 latency under sustained load',
  },
  mcp: {
    title: 'An agent reaching onchain state',
    caption: 'One governed interface between the tool call and 300+ chains.',
    label: 'tool call → onchain state',
  },
  webhooks: {
    title: 'Provider events, normalised',
    caption: 'Four provider-specific event shapes arriving as one signed, versioned payload.',
    label: 'signed · retried · versioned',
  },
};

/**
 * Three layers, three arrangements of the same units: 5+7, then 7+5 with the
 * diagram on the left (flip), then 4+8. Desktop column order is DOM order, so a
 * flipped row writes the diagram first; mobile re-stacks note above viz on its
 * own, since there `.lp-pair` is a real flex container.
 */
const SHAPES = [
  { note: 5, viz: 7, flip: false },
  { note: 5, viz: 7, flip: true },
  { note: 4, viz: 8, flip: false },
];

export function FullStack() {
  return (
    <Band className="lp-stack">
      <SectionRule index="05" />
      <BandHead
        wide
        title={fullStack.title}
        lede={fullStack.body}
      />

      <div className="lp-blocks" data-reveal>
        {fullStack.cards.map((card, i) => {
          const Diagram = diagrams[card.id];
          const shape = SHAPES[i];
          const cap = CAPTIONS[card.id];

          const note = (
            <Win w={shape.note} variant="flat" className="win-note">
              <h3 className="win-note-title">{card.title}</h3>
              <p className="win-note-body">{card.body}</p>
              <ul className="lp-points">
                {card.points.map((point) => (
                  <li key={point}>
                    <Icon.Check size={13} /> {point}
                  </li>
                ))}
              </ul>
            </Win>
          );

          const viz = (
            <Win
              w={shape.viz}
              bare
              title={cap.title}
              caption={cap.caption}
              label={cap.label}
            >
              <Diagram />
            </Win>
          );

          return (
            <div key={card.id} className="lp-pair">
              {shape.flip ? viz : note}
              {shape.flip ? note : viz}
            </div>
          );
        })}
      </div>
    </Band>
  );
}
