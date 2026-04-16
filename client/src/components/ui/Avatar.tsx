import type { User } from '../../lib/api/endpoints';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
type PresenceStatus = 'online' | 'away' | 'dnd' | 'offline';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: AvatarSize;
  status?: PresenceStatus;
  user?: User;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
};

const statusColors: Record<PresenceStatus, string> = {
  online: 'var(--color-presence-online)',
  away: 'var(--color-presence-away)',
  dnd: 'var(--color-presence-busy)',
  offline: 'var(--color-presence-offline)',
};

const statusSizeMap: Record<AvatarSize, number> = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 14,
};

export function Avatar({
  src,
  alt,
  size = 'md',
  status,
  user,
}: AvatarProps): JSX.Element {
  const dimension = sizeMap[size];
  const statusDotSize = statusSizeMap[size];
  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="relative inline-flex flex-shrink-0"
      style={{ width: dimension, height: dimension }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          style={{ borderRadius: 'var(--radius-full)' }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-medium"
          style={{
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent-gradient)',
            fontSize: dimension * 0.35,
          }}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2"
          style={{
            width: statusDotSize,
            height: statusDotSize,
            backgroundColor: statusColors[status],
            borderColor: 'var(--color-elevated)',
          }}
        />
      )}
    </div>
  );
}
