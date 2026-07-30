import { Icon } from '../../components/Icons';
import { Empty } from '../../components/ui';
import { Band, BandHead, SectionRule } from './Band';
import { customerStory } from '../content/home';

/**
 * The result is the headline, so the figures are set at display size and the
 * quote runs full width underneath. The portrait slot carries the system's
 * `Empty` state — the photograph isn't available to this build.
 */
export function CustomerStory() {
  return (
    <Band className="lp-story">
      <SectionRule index="06" />
      <BandHead wide title={customerStory.title} />

      <div className="lp-blocks lp-story-grid">
        <div className="lp-story-figures" style={{ '--w': 4, '--h': 3 } as React.CSSProperties} data-reveal>
          {customerStory.stats.map((stat) => (
            <div key={stat.id} className="lp-story-figure">
              <span className="lp-story-num">{stat.value}</span>
              <span className="lp-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="lp-story-body" style={{ '--w': 8, '--h': 3 } as React.CSSProperties} data-reveal>
          {customerStory.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      <figure className="lp-quote" data-reveal>
        <span className="lp-quote-mark" aria-hidden>
          <Icon.Social size={20} />
        </span>
        <blockquote className="lp-quote-text">{customerStory.quote}</blockquote>
        <figcaption className="lp-quote-author">
          <div className="lp-media lp-media-portrait">
            <Empty bare icon={<Icon.Image size={16} />} title="Portrait" />
          </div>
          <span>
            <span className="lp-quote-author-name">{customerStory.author.name}</span>
            <span className="lp-quote-author-role">{customerStory.author.role}</span>
          </span>
          <span className="lp-quote-attr push-right">{customerStory.attribution}</span>
        </figcaption>
      </figure>
    </Band>
  );
}
