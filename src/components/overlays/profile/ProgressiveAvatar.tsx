import { LevelIndicator } from './LevelIndicator';

interface ProgressiveAvatarProps {
  level: number;
  onClick: () => void;
}

/**
 * BUILD-TIME: Visual state derived from CharacterLibrary XP thresholds.
 * Currently renders a frog emoji placeholder.
 */
export function ProgressiveAvatar({ level, onClick }: ProgressiveAvatarProps) {
  return (
    <button
      type="button"
      className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl hover:bg-green-200"
      onClick={onClick}
      aria-label="View stat groups"
    >
      🐸
      <LevelIndicator level={level} />
    </button>
  );
}
