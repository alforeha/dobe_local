interface ScheduleRoomSubHeaderProps {
  filterValue: string;
  onFilterChange: (v: string) => void;
}

export function ScheduleRoomSubHeader({
  filterValue,
  onFilterChange,
}: ScheduleRoomSubHeaderProps) {
  return (
    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
      <input
        type="text"
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Filter routines..."
        className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-300"
      />
      <button type="button" className="text-xs text-blue-500 font-medium shrink-0">
        + Add
      </button>
    </div>
  );
}
