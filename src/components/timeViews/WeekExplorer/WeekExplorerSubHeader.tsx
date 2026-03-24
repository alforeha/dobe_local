const DAYS = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

/** Fixed sub-header showing day-of-week labels for the explorer grid. */
export function WeekExplorerSubHeader() {
  return (
    <div className="flex shrink-0 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1">
      {DAYS.map((d) => (
        <div key={d} className="flex-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
          {d}
        </div>
      ))}
    </div>
  );
}
