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
  /** Optional multi-day label shown inside the block */
  multiDayLabel?: string;
  interactive: boolean;
  onOpen?: () => void;
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
  multiDayLabel,
  interactive,
  onOpen,
}: EventBlockProps) {
  const widthPct = 100 / colCount;
  const leftPct = colIndex * widthPct;
  const isComplete = completionState === 'complete';
  const opacityClass = isComplete ? 'opacity-50' : (!interactive ? 'opacity-70' : '');

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive && onOpen ? (e) => e.key === 'Enter' && onOpen() : undefined}
      className={`absolute rounded px-1.5 py-0.5 text-xs text-white shadow-sm overflow-hidden
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
          <span className="font-bold text-[10px] tracking-widest rotate-[-8deg] text-white/90">
            [COMPLETED]
          </span>
        </div>
      )}

      <div className="font-semibold truncate leading-tight">{name}</div>
      {heightPx >= 30 && (
        <div className="text-white/80 text-[10px] leading-tight">{startTime} → {endTime}</div>
      )}
      {multiDayLabel && (
        <div className="text-white/90 text-[9px] font-medium">{multiDayLabel}</div>
      )}
      {taskCount > 0 && heightPx >= 44 && (
        <div className="text-white/80 text-right">{taskComplete}/{taskCount}</div>
      )}
    </div>
  );
}
