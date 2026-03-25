import { resolveIcon } from '../../../constants/iconMap';

interface EventBlockProps {
  eventId: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
  icon?: string;
  heightPx: number;
  taskCount: number;
  taskComplete: number;
  completionState?: string;
  topOffset: number;
  colIndex: number;
  colCount: number;
  colSpan: number;
  multiDayLabel?: string;
  interactive: boolean;
  onOpen?: () => void;
  muted?: boolean;
  glow?: boolean;
}

export function EventBlock({
  name,
  color,
  startTime,
  endTime,
  icon,
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
  glow = false,
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
      {glow && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded ring-4 ring-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
      )}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded">
          <span className="font-bold text-sm tracking-widest rotate-[-8deg] text-white/90 text-center px-1">
            [COMPLETED]
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="font-semibold truncate leading-tight text-sm">
          {icon && (
            <span className="mr-1 opacity-90" aria-hidden="true">{resolveIcon(icon)}</span>
          )}
          {name}
        </div>
        {heightPx >= 30 && (
          <div className="text-white/80 text-[11px] leading-tight truncate">{startTime} → {endTime}</div>
        )}
        {multiDayLabel && (
          <div className="text-white/90 text-[9px] font-medium truncate">{multiDayLabel}</div>
        )}
      </div>

      {taskCount > 0 && heightPx >= 44 && (
        <div className="shrink-0 text-white/80 text-base font-bold leading-none">{taskComplete}/{taskCount}</div>
      )}
    </div>
  );
}
