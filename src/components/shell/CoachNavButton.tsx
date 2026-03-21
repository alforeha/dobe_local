interface CoachNavButtonProps {
  onOpen: () => void;
}

export function CoachNavButton({ onOpen }: CoachNavButtonProps) {
  return (
    <button
      type="button"
      aria-label="Open coach"
      onClick={onOpen}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-base hover:bg-green-200 transition-colors"
    >
      🐸
    </button>
  );
}
