import { format } from '../../../utils/dateUtils';

interface DayViewHeaderProps {
  date: Date;
  onBack: () => void;
  onForward: () => void;
  onToday: () => void;
}

export function DayViewHeader({ date, onBack, onForward, onToday }: DayViewHeaderProps) {
  const isToday = format(date, 'iso') === format(new Date(), 'iso');

  return (
    <div className="flex shrink-0 items-center border-b border-gray-200 bg-white px-3 py-2">
      {/* Back */}
      <button
        type="button"
        aria-label="Previous day"
        onClick={onBack}
        className="p-1 text-gray-500 hover:text-gray-800"
      >
        ‹
      </button>

      {/* Centre: date + quick actions placeholder */}
      <div className="flex flex-1 flex-col items-center">
        <button
          type="button"
          onClick={onToday}
          className={`text-sm font-semibold ${isToday ? 'text-purple-600' : 'text-gray-800'}`}
        >
          {format(date, 'display')}
        </button>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {/* Weather placeholder — empty per spec (MULTI-USER) */}
          <span className="w-8" />
          {/* GTD icons placeholder */}
          <span className="text-gray-300">GTD</span>
        </div>
      </div>

      {/* Forward */}
      <button
        type="button"
        aria-label="Next day"
        onClick={onForward}
        className="p-1 text-gray-500 hover:text-gray-800"
      >
        ›
      </button>
    </div>
  );
}
