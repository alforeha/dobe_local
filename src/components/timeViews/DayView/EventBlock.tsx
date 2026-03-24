/** Height of one hour row in px — must match min-h-14 (3.5rem × 16px) in DayViewBody */
const ROW_HEIGHT_PX = 56;

function parseMinutes(time: string): number {
  if (!time) return 0;
  const parts = time.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

interface EventBlockProps {
  eventId: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  taskCount: number;
  taskComplete: number;
  completionState?: string;
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
  completionState,
  offsetIndex,
  interactive,
  onOpen,
}: EventBlockProps) {
  const offset = offsetIndex * 8; // px offset per overlapping event

  // Part 3: height proportional to duration; minimum 32px so short events are tappable
  const durationMin = Math.max(0, parseMinutes(endTime) - parseMinutes(startTime));
  const heightPx = Math.max(32, (durationMin / 60) * ROW_HEIGHT_PX);

  // Part 4: completion state
  const isComplete = completionState === 'complete';
  const opacityClass = isComplete ? 'opacity-50' : (!interactive ? 'opacity-70' : '');

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive && onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      className={`absolute top-0.5 rounded px-1.5 py-0.5 text-xs text-white shadow-sm
        ${interactive ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
        ${opacityClass}`}
      style={{
        backgroundColor: color,
        left: `${offset}px`,
        right: '4px',
        zIndex: offsetIndex,
        height: `${heightPx}px`,
      }}
    >
      {/* Completed overlay — centered, slightly rotated (Part 4) */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded">
          <span className="font-bold text-[10px] tracking-widest rotate-[-8deg] text-white/90">
            [COMPLETED]
          </span>
        </div>
      )}

      <div className="font-semibold truncate">{name}</div>
      <div className="text-white/80">{startTime} → {endTime}</div>
      {taskCount > 0 && (
        <div className="text-white/80 text-right">{taskComplete}/{taskCount}</div>
      )}
    </div>
  );
}
