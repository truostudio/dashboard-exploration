import { useState } from 'react';
import { Icon } from '../../components/Icons';
import { Band, BandHead, SectionRule } from './Band';
import { faq } from '../content/home';

export function Faq() {
  // One open at a time; the grid-rows collapse is the same recipe the sidebar
  // uses for its nav groups.
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Band className="lp-faq-band">
      <SectionRule index="10" />
      <BandHead title={faq.title} lede={faq.body} />

      <div className="lp-faq" data-reveal>
        {faq.items.map((item, i) => {
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
