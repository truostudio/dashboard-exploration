type AvatarProps = {
  /** Artwork URL. When absent a pixel monogram is drawn from `name`. */
  src?: string;
  name: string;
  /** sm 20 · md 28 · lg 36 · xl 44 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

/**
 * Provider and chain artwork. Not every provider ships an icon, so this always
 * renders something: a monogram rather than a generic placeholder.
 */
export function Avatar({ src, name, size = 'lg', className = '' }: AvatarProps) {
  const cls = `avatar-art avatar-${size} ${className}`.trim();
  if (src) return <img className={cls} src={src} alt="" />;
  return (
    <span className={`${cls} avatar-monogram pixel`} aria-hidden>
      {name.slice(0, 1)}
    </span>
  );
}

/** Overlapping stack of chain marks, with an optional trailing count. */
export function AvatarStack({
  items,
  more,
}: {
  items: { id: string; icon: string; name: string }[];
  more?: string;
}) {
  return (
    <span className="chain-avatars">
      {items.map((item) => (
        <img key={item.id} className="chain-avatar" src={item.icon} alt={item.name} title={item.name} />
      ))}
      {more && <span className="chain-avatar more">{more}</span>}
    </span>
  );
}
