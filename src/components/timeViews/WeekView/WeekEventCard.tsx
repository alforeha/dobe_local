interface WeekEventCardProps {
  name: string;
  color: string;
  topPx: number;
  heightPx: number;
  leftPercent: number;
  widthPercent: number;
}

/** Absolutely-positioned event card in WeekView. Left border color swatch, name truncated. */
export function WeekEventCard({ name, color, topPx, heightPx, leftPercent, widthPercent }: WeekEventCardProps) {
  return (
    <div
      className="absolute overflow-hidden rounded text-xs font-medium text-white"
      style={{
        top: topPx,
        height: heightPx,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        borderLeft: `4px solid ${color}`,
        backgroundColor: `${color}cc`,
      }}
    >
      <span className="block overflow-hidden whitespace-nowrap px-1 leading-tight" style={{ paddingTop: 2 }}>
        {name}
      </span>
    </div>
  );
}
