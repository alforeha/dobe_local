interface WeekEventCardProps {
  name: string;
  color: string;
}

/** Name-only event card in WeekView. Color from PlannedEvent.color. */
export function WeekEventCard({ name, color }: WeekEventCardProps) {
  return (
    <div
      className="truncate rounded px-1 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </div>
  );
}
