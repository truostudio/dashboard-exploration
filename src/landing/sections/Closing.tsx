import { closing } from '../content/home';

export function Closing() {
  return (
    <section className="lp-closing lp-invert">
      <div className="lp-hero-field" aria-hidden />
      <div className="lp-closing-inner">
        <h2 data-reveal>
          <span className="lp-line">
            <span>{closing.title}</span>
          </span>
        </h2>
        <p data-reveal>{closing.body}</p>
        <div data-reveal>
          <button className="btn primary btn-lg">{closing.cta}</button>
        </div>
      </div>
    </section>
  );
}
