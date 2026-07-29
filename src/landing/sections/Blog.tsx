import { Icon } from '../../components/Icons';
import { Empty } from '../../components/ui';
import { Band, BandHead, SectionRule } from './Band';
import { blog } from '../content/home';

/**
 * The lead article runs large with its artwork; the other two sit beside it as
 * a ruled list. Article images aren't available to this build, so the slots
 * carry the system's `Empty` state rather than a placeholder graphic.
 */
export function Blog() {
  const [lead, ...rest] = blog.posts;

  return (
    <Band className="lp-blog">
      <SectionRule index="08" />
      <BandHead
        wide
        title={blog.title}
        lede={blog.body}
        actions={
          <button className="btn btn-lg">
            {blog.cta} <Icon.Chevron size={13} />
          </button>
        }
      />

      <div className="lp-blocks lp-blog-grid">
        <article className="lp-lead" data-reveal>
          <div className="lp-media lp-media-lead">
            <Empty icon={<Icon.Image size={20} />} title="Article image">
              Artwork for “{lead.title}” lives in the CMS.
            </Empty>
          </div>
          <div className="lp-lead-copy">
            <h3 className="lp-lead-title">{lead.title}</h3>
            <p className="lp-lead-excerpt">{lead.excerpt}</p>
            <div className="lp-post-byline">
              <span>{lead.author}</span>
              <span aria-hidden>·</span>
              <span>{lead.date}</span>
              <Icon.Chevron size={12} className="push-right" />
            </div>
          </div>
        </article>

        <div className="lp-blog-rest" style={{ '--w': 5, '--h': 5 } as React.CSSProperties}>
          {rest.map((post) => (
            <article key={post.id} className="lp-post-row" data-reveal>
              <div className="lp-media lp-media-thumb">
                <Empty bare icon={<Icon.Image size={16} />} title="Image" />
              </div>
              <div className="lp-post-row-copy">
                <h3 className="lp-post-title">{post.title}</h3>
                <p className="lp-post-excerpt">{post.excerpt}</p>
                <div className="lp-post-byline">
                  <span>{post.author}</span>
                  <span aria-hidden>·</span>
                  <span>{post.date}</span>
                  <Icon.Chevron size={12} className="push-right" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Band>
  );
}
