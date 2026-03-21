import { format } from '../../../utils/dateUtils';

interface WeekExplorerHeaderProps {
  seedDate: Date;
  windowStart: Date;
  windowEnd: Date;
  onSeedChange: (d: Date) => void;
}

export function WeekExplorerHeader({ seedDate, windowStart, windowEnd, onSeedChange }: WeekExplorerHeaderProps) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(d.getTime())) onSeedChange(d);
  };

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
      {/* Left */}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">57 Week Explorer</span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>SEED:</span>
          <input
            type="date"
            value={format(seedDate, 'iso')}
            onChange={handleInput}
            className="border-b border-gray-300 bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Right: range display */}
      <div className="flex flex-col items-end text-xs text-gray-400">
        <span>−13w → {format(windowStart, 'iso')}</span>
        <span>+44w → {format(windowEnd, 'iso')}</span>
      </div>
    </div>
  );
}
