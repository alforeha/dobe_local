interface QACompletionIconProps {
  /** Emoji or character to display in the badge */
  icon: string;
  /** Horizontal offset index for multiple completions in the same hour slot */
  offsetIndex: number;
  /** Distance from top of the day-grid container in px */
  topPx: number;
  onClick: () => void;
}

/** Small circular badge icon for a QA completion in the DayView unified grid */
export function QACompletionIcon({ icon, offsetIndex, topPx, onClick }: QACompletionIconProps) {
  const leftOffset = offsetIndex * 30; // 30px per badge so they don't overlap

  return (
    <button
      type="button"
      aria-label={`Quick action completion ${icon}`}
      onClick={onClick}
      className="absolute flex h-7 w-7 items-center justify-center rounded-full
        bg-purple-500 text-sm shadow ring-2 ring-white
        hover:bg-purple-600 active:scale-95 transition-transform"
      style={{ top: `${topPx}px`, left: `${leftOffset}px`, zIndex: 20 + offsetIndex }}
    >
      {icon}
    </button>
  );
}
