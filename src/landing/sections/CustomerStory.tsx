import { useState } from 'react';
import { Icon } from '../../components/Icons';
import { Empty } from '../../components/ui';
import { Band, BandHead, SectionRule } from './Band';
import { customerStories } from '../content/home';

/**
 * Case-study carousel. Portrait + identity on the left, body and quote
 * stacked on the right so the column fills; stats as a ruled row under
 * the pair. Matches the live Oku layout without the empty lower-right void.
 */
export function CustomerStory() {
  const [index, setIndex] = useState(0);
  const total = customerStories.length;
  const story = customerStories[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Band className="lp-story">
      <SectionRule index="07" />
      <BandHead
        wide
        title={story.title}
        actions={
          <div className="lp-story-nav" role="group" aria-label="Case studies">
            <button
              type="button"
              className="btn"
              onClick={prev}
              aria-label="Previous case study"
            >
              <Icon.ChevronLeft size={14} />
            </button>
            <span className="lp-story-index" aria-live="polite">
              {pad(index + 1)} / {pad(total)}
            </span>
            <button
              type="button"
              className="btn"
              onClick={next}
              aria-label="Next case study"
            >
              <Icon.Chevron size={14} />
            </button>
          </div>
        }
      />

      <div className="lp-blocks lp-story-grid" key={story.id}>
        <div className="lp-story-side" style={{ '--w': 4 } as React.CSSProperties} data-reveal>
          <div className="lp-media lp-media-ceo">
            {story.portrait ? (
              <img src={story.portrait} alt={story.author.name} />
            ) : (
              <Empty icon={<Icon.Users size={20} />} title="CEO portrait">
                Photograph of {story.author.name} for the {story.company} story.
              </Empty>
            )}
          </div>
          <div className="lp-story-identity">
            <span className="lp-story-identity-name">{story.author.name}</span>
            <span className="lp-story-identity-role">{story.author.role}</span>
          </div>
        </div>

        <div className="lp-story-main" style={{ '--w': 8 } as React.CSSProperties} data-reveal>
          <div className="lp-story-body">
            {story.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <figure className="lp-quote">
            <span className="lp-quote-mark" aria-hidden>
              <Icon.Social size={20} />
            </span>
            <blockquote className="lp-quote-text">{story.quote}</blockquote>
            <figcaption className="lp-quote-attr">{story.attribution}</figcaption>
          </figure>

          {/* Inside the story column, not a full-measure row under it, as its
              own band the figures read as belonging to the next section. */}
          <div className="lp-story-figures">
            {story.stats.map((stat) => (
              <div key={stat.id} className="lp-story-figure">
                <span className="lp-story-num">{stat.value}</span>
                <span className="lp-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Band>
  );
}
