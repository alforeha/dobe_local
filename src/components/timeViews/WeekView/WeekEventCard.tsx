interface WeekEventCardProps {
  name: string;
  color: string;
  topPx: number;
  heightPx: number;
  leftPercent: number;
  widthPercent: number;
  muted?: boolean;
}

/** Absolutely-positioned event card in WeekView. Left border color swatch, name truncated. */
export function WeekEventCard({ name, color, topPx, heightPx, leftPercent, widthPercent, muted }: WeekEventCardProps) {
  return (
    <div
      className={`absolute overflow-hidden rounded text-xs font-medium text-white ${muted ? 'opacity-40' : ''}`}
      style={{
        top: topPx,
        height: heightPx,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        borderLeft: `4px solid ${color}`,
        backgroundColor: `${color}cc`,
      }}
    >
      <span className="flex h-full items-center overflow-hidden whitespace-nowrap px-1 text-left leading-tight">
        {name}
      </span>
    </div>
  );
}
