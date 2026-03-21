interface MenuNavButtonProps {
  onOpen: () => void;
}

export function MenuNavButton({ onOpen }: MenuNavButtonProps) {
  return (
    <button
      type="button"
      aria-label="Open menu"
      onClick={onOpen}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base hover:bg-gray-200 transition-colors"
    >
      ☰
    </button>
  );
}
