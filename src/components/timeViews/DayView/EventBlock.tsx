/** Height of one hour row in px — must match DayViewBody ROW_HEIGHT_PX */
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
  /** End time used for height (may be '23:59' for continues-tomorrow events) */
  endTime: string;
  taskCount: number;
  taskComplete: number;
  completionState?: string;
  /** Pixels from top of the hour row content area (set by layout engine) */
  topOffset: number;
  /** 0-based column index within concurrent overlap group */
  colIndex: number;
  /** Total columns in overlap group — 1 means full width */
  colCount: number;
  /** Optional label shown inside the block, e.g. '↓ continues' */
  multiDayLabel?: string;
  interactive: boolean;
  onOpen?: () => void;
}

/** Event block in DayView — positioned by the UV-C layout engine. */
export function EventBlock({
  name,
  color,
  startTime,
  endTime,
  taskCount,
  taskComplete,
  completionState,
  topOffset,
  colIndex,
  colCount,
  multiDayLabel,
  interactive,
  onOpen,
}: EventBlockProps) {
  const widthPct = 100 / colCount;
  const leftPct = colIndex * widthPct;

  // Height proportional to duration; minimum 32px so short events are tappable
  const durationMin = Math.max(0, parseMinutes(endTime) - parseMinutes(startTime));
  const heightPx = Math.max(32, (durationMin / 60) * ROW_HEIGHT_PX);

  const isComplete = completionState === 'complete';
  const opacityClass = isComplete ? 'opacity-50' : (!interactive ? 'opacity-70' : '');

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive && onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      className={`absolute rounded px-1.5 py-0.5 text-xs text-white shadow-sm
        ${interactive ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
        ${opacityClass}`}
      style={{
        backgroundColor: color,
        top: `${topOffset + 2}px`,
        left: `${leftPct}%`,
        width: `calc(${widthPct}% - 4px)`,
        height: `${heightPx}px`,
        zIndex: colIndex + 1,
      }}
    >
      {/* Completed overlay — centered, slightly rotated */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded">
          <span className="font-bold text-[10px] tracking-widest rotate-[-8deg] text-white/90">
            [COMPLETED]
          </span>
        </div>
      )}

      <div className="font-semibold truncate">{name}</div>
      <div className="text-white/80">{startTime} → {endTime}</div>
      {multiDayLabel && (
        <div className="text-white/90 text-[9px] font-medium">{multiDayLabel}</div>
      )}
      {taskCount > 0 && (
        <div className="text-white/80 text-right">{taskComplete}/{taskCount}</div>
      )}
    </div>
  );
}
