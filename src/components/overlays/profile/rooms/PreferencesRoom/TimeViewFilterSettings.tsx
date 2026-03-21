import { useSystemStore } from '../../../../../stores/useSystemStore';

export function TimeViewFilterSettings() {
  const settings = useSystemStore((s) => s.settings);
  const setSettings = useSystemStore((s) => s.setSettings);

  const dayStart = settings?.timePreferences.dayStart ?? '06:00';
  const weekStart = settings?.timePreferences.weekStart ?? 'mon';

  const update = (key: 'dayStart' | 'weekStart', value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      timePreferences: { ...settings.timePreferences, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time view filters</p>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700 w-24 shrink-0">Day start</label>
        <input
          type="time"
          value={dayStart}
          onChange={(e) => update('dayStart', e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700 w-24 shrink-0">Week start</label>
        <select
          value={weekStart}
          onChange={(e) => update('weekStart', e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
