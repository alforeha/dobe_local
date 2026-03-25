import { useUserStore } from '../../stores/useUserStore';

interface ProfileNavButtonProps {
  onOpen: () => void;
}

export function ProfileNavButton({ onOpen }: ProfileNavButtonProps) {
  const user = useUserStore((s) => s.user);
  const initials = user?.system?.displayName?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <button
      type="button"
      aria-label="Open profile"
      onClick={onOpen}
      className="flex h-full w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700 hover:bg-purple-200 transition-colors dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
    >
      {initials}
    </button>
  );
}
