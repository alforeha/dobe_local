interface MenuNavButtonProps {
  onOpen: () => void;
}

export function MenuNavButton({ onOpen }: MenuNavButtonProps) {
  return (
    <button
      type="button"
      aria-label="Open menu"
      onClick={onOpen}
      className="flex h-full w-full items-center justify-center text-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
    >
      ☰
    </button>
  );
}
