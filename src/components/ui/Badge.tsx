import type { ReactNode } from 'react';
import type { Method } from '../../data/catalog';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'new' | 'solid';

type BadgeProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  const toneClass = tone === 'neutral' ? '' : tone;
  return <span className={`badge ${toneClass} ${className}`.trim()}>{children}</span>;
}

/** GET / POST / WS, coloured consistently wherever an endpoint is listed. */
export function MethodBadge({ method }: { method: Method }) {
  const tone = method === 'GET' ? 'method-get' : method === 'POST' ? 'method-post' : 'method-ws';
  return <span className={`badge ${tone}`}>{method}</span>;
}

/** Small square status marker. */
export function Dot({ tone }: { tone?: 'ok' | 'warn' }) {
  return <span className={`dot ${tone ?? ''}`.trim()} aria-hidden />;
}
