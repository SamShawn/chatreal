import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    borderColor: 'var(--color-border-visible)',
  },
  accent: {
    backgroundColor: 'var(--color-accent-subtle)',
    color: 'var(--color-accent)',
    borderColor: 'transparent',
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    color: 'var(--color-success)',
    borderColor: 'transparent',
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: 'var(--color-warning)',
    borderColor: 'transparent',
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--color-error)',
    borderColor: 'transparent',
  },
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'var(--color-text-muted)',
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

export function Badge({
  variant = 'default',
  dot = false,
  children,
  className = '',
}: BadgeProps): JSX.Element {
  return (
    <span
      className={`badge-base ${className}`}
      style={variantStyles[variant]}
    >
      {dot && (
        <span
          style={{ backgroundColor: dotColors[variant] }}
          className="badge-dot"
        />
      )}
      {children}
    </span>
  );
}
