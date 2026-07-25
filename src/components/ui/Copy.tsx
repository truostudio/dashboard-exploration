import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../Icons';

/**
 * Copy-to-clipboard with a transient confirmation. Tracks which key was copied
 * so one hook can serve a whole list of rows.
 */
export function useCopy(resetMs = 1200) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = useCallback(
    (value: string, key = value) => {
      navigator.clipboard?.writeText(value);
      setCopiedKey(key);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedKey(null), resetMs);
    },
    [resetMs],
  );

  return { copy, copiedKey, isCopied: (key: string) => copiedKey === key };
}

type CopyButtonProps = {
  value: string;
  /** Distinguishes rows that share a hook; defaults to `value`. */
  copyKey?: string;
  /** Omit for an icon-only button. */
  label?: string;
  /** Label shown while confirmed. */
  copiedLabel?: string;
  variant?: 'ghost' | 'default';
  size?: number;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

export function CopyButton({
  value,
  copyKey,
  label,
  copiedLabel = 'Copied',
  variant = 'ghost',
  size = 14,
  disabled,
  className = '',
}: CopyButtonProps) {
  const { copy, isCopied } = useCopy();
  const key = copyKey ?? value;
  const done = isCopied(key);
  const iconOnly = !label;

  return (
    <button
      type="button"
      className={`btn ${variant === 'ghost' ? 'ghost' : ''} ${iconOnly ? 'icon-only' : ''} ${className}`.trim()}
      onClick={(e) => { e.stopPropagation(); copy(value, key); }}
      disabled={disabled}
      aria-label={iconOnly ? `Copy ${value}` : undefined}
    >
      {done ? <Icon.Check size={size} /> : <Icon.Copy size={size} />}
      {label && (done ? copiedLabel : label)}
    </button>
  );
}
