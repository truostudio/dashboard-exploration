export type MeterSegment = {
  /** Share of the whole, 0–100. */
  value: number;
  color: string;
};

type Props = {
  segments: MeterSegment[];
  /** Big value in the middle, e.g. "98.2%". */
  value: string;
  /** Small caption under it, e.g. "2xx". */
  caption?: string;
  size?: number;
  thickness?: number;
};

/**
 * A square ring gauge. Stroke length is measured along the perimeter, so a
 * segment's share of the square is linear, unlike a conic gradient, where a
 * square's corners exaggerate the same angle.
 */
export function SquareMeter({ segments, value, caption, size = 132, thickness = 10 }: Props) {
  const inset = thickness / 2;
  const side = size - thickness;
  const perimeter = side * 4;
  // A <rect> stroke starts at the top-left corner; shift by half a side so the
  // gauge reads as starting from top-center.
  const start = side / 2;

  let consumed = 0;

  return (
    <div className="meter" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <rect
          x={inset}
          y={inset}
          width={side}
          height={side}
          fill="none"
          stroke="var(--ub-grid)"
          strokeWidth={thickness}
        />
        {segments.map((segment, i) => {
          const length = Math.max(0, (segment.value / 100) * perimeter);
          const dashOffset = -(start + consumed);
          consumed += length;
          return (
            <rect
              key={i}
              x={inset}
              y={inset}
              width={side}
              height={side}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${length} ${perimeter - length}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <div className="meter-center">
        <span className="meter-num">{value}</span>
        {caption && <span className="meter-caption dim">{caption}</span>}
      </div>
    </div>
  );
}
