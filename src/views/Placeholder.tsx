import { Icon } from '../components/Icons';

type Props = {
  title: string;
  description: string;
  icon?: keyof typeof Icon;
};

export function Placeholder({ title, description, icon = 'Grid' }: Props) {
  const I = Icon[icon];
  return (
    <div className="view">
      <section className="panel placeholder">
        <span className="ph-icon" aria-hidden>
          <I size={22} />
        </span>
        <h2 className="panel-title">{title}</h2>
        <p className="panel-sub dim">{description}</p>
        <div className="ph-actions">
          <button className="btn">Read docs</button>
          <button className="btn primary">Get started</button>
        </div>
      </section>
    </div>
  );
}
