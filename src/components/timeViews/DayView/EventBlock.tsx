interface EventBlockProps {
  eventId: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  /** Pre-calculated height in px from the layout engine */
  heightPx: number;
  taskCount: number;
  taskComplete: number;
  completionState?: string;
  /** Distance from top of the day-grid container in px */
  topOffset: number;
  /** 0-based column index within concurrent overlap group */
  colIndex: number;
  /** Total columns in overlap group — 1 means full width */
  colCount: number;
  /** Number of columns this event spans to the right (default 1) */
  colSpan: number;
  /** Optional multi-day label shown inside the block */
  multiDayLabel?: string;
  interactive: boolean;
  onOpen?: () => void;
  muted?: boolean;
}

/** Event block in DayView — absolutely positioned within the unified day-grid. */
export function EventBlock({
  name,
  color,
  startTime,
  endTime,
  heightPx,
  taskCount,
  taskComplete,
  completionState,
  topOffset,
  colIndex,
  colCount,
  colSpan,
  multiDayLabel,
  interactive,
  onOpen,
  muted,
}: EventBlockProps) {
  const widthPct = (colSpan / colCount) * 100;
  const leftPct = (colIndex / colCount) * 100;
  const isComplete = completionState === 'complete';
  const opacityClass = muted ? 'opacity-40' : isComplete ? 'opacity-50' : (!interactive ? 'opacity-70' : '');

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive && onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      className={`absolute rounded px-1.5 py-1 text-white shadow-sm overflow-hidden flex items-center gap-1
        ${interactive ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
        ${opacityClass}`}
      style={{
        backgroundColor: color,
        top: `${topOffset}px`,
        left: `${leftPct}%`,
        width: `calc(${widthPct}% - 4px)`,
        height: `${heightPx}px`,
        zIndex: colIndex + 1,
      }}
    >
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded">
          <span className="font-bold text-sm tracking-widest rotate-[-8deg] text-white/90 text-center px-1">
            [COMPLETED]
          </span>
        </div>
      )}

      {/* Left: name + time */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="font-semibold truncate leading-tight text-sm">{name}</div>
        {heightPx >= 30 && (
          <div className="text-white/80 text-[11px] leading-tight truncate">{startTime} → {endTime}</div>
        )}
        {multiDayLabel && (
          <div className="text-white/90 text-[9px] font-medium truncate">{multiDayLabel}</div>
        )}
      </div>

      {/* Right: task count */}
      {taskCount > 0 && heightPx >= 44 && (
        <div className="shrink-0 text-white/80 text-base font-bold leading-none">{taskComplete}/{taskCount}</div>
      )}
    </div>
  );
}
