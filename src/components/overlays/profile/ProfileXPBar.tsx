import { XPBarVisual } from '../../../shared/XPBarVisual';

interface ProfileXPBarProps {
  xp: number;
  level: number;
}

function xpForLevel(level: number) {
  return level * 1000;
}

export function ProfileXPBar({ xp, level }: ProfileXPBarProps) {
  const base = xpForLevel(level - 1);
  const cap = xpForLevel(level);
  const pct = cap > base ? Math.min(1, (xp - base) / (cap - base)) : 0;

  return (
    <div className="px-4 py-2">
      <XPBarVisual pct={pct} />
      <p className="mt-1 text-center text-xs text-gray-400">
        {xp.toLocaleString()} XP total
      </p>
    </div>
  );
}
