interface EventBlockProps {
  eventId: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  taskCount: number;
  taskComplete: number;
  /** Horizontal offset index for overlapping events (UI-05) */
  offsetIndex: number;
  interactive: boolean;
  onOpen?: () => void;
}

/** Event block in DayView. Color from PlannedEvent.color. Overlapping events offset horizontally (UI-05). */
export function EventBlock({
  name,
  color,
  startTime,
  endTime,
  taskCount,
  taskComplete,
  offsetIndex,
  interactive,
  onOpen,
}: EventBlockProps) {
  const offset = offsetIndex * 8; // px offset per overlapping event

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive && onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      className={`absolute top-0.5 h-12 rounded px-1.5 py-0.5 text-xs text-white shadow-sm
        ${interactive ? 'cursor-pointer hover:brightness-110' : 'cursor-default opacity-70'}`}
      style={{
        backgroundColor: color,
        left: `${offset}px`,
        right: '4px',
        zIndex: offsetIndex,
      }}
    >
      <div className="font-semibold truncate">{name}</div>
      <div className="text-white/80">{startTime} → {endTime}</div>
      {taskCount > 0 && (
        <div className="text-white/80">{taskComplete}/{taskCount}</div>
      )}
    </div>
  );
}
