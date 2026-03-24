import { useSystemStore } from '../../../../../stores/useSystemStore';
import type { TimePreferences, WeekViewPreferences } from '../../../../../types/settings';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const DEFAULTS: TimePreferences = {
  dayView:      { startTime: '06:00', endTime: '23:00' },
  weekView:     { startTime: '06:00', endTime: '22:00', visibleDays: ALL_DAYS },
  explorerView: { startTime: '00:00', endTime: '23:59', visibleDays: ALL_DAYS },
};

function TimePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-10 shrink-0">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-800 dark:text-gray-100"
      />
    </div>
  );
}

function DayPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const toggle = (d: number) => {
    const next = value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b);
    if (next.length === 0) return;
    onChange(next);
  };
  return (
    <div className="flex gap-1 mt-1">
      {ALL_DAYS.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => toggle(d)}
          className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
            value.includes(d)
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          {DAY_LABELS[d][0]}
          <span className="hidden sm:inline">{DAY_LABELS[d].slice(1)}</span>
        </button>
      ))}
    </div>
  );
}

export function TimeViewFilterSettings() {
  const settings = useSystemStore((s) => s.settings);
  const setSettings = useSystemStore((s) => s.setSettings);

  const prefs: TimePreferences = {
    dayView:      settings?.timePreferences?.dayView      ?? DEFAULTS.dayView,
    weekView:     { ...DEFAULTS.weekView, ...settings?.timePreferences?.weekView,     visibleDays: settings?.timePreferences?.weekView?.visibleDays     ?? DEFAULTS.weekView.visibleDays },
    explorerView: { ...DEFAULTS.explorerView, ...settings?.timePreferences?.explorerView, visibleDays: settings?.timePreferences?.explorerView?.visibleDays ?? DEFAULTS.explorerView.visibleDays },
  };

  const updateTime = (view: 'dayView' | 'weekView' | 'explorerView', field: 'startTime' | 'endTime', value: string) => {
    if (!settings) return;
    setSettings({ ...settings, timePreferences: { ...prefs, [view]: { ...prefs[view], [field]: value } } });
  };

  const updateDays = (view: 'weekView' | 'explorerView', value: number[]) => {
    if (!settings) return;
    setSettings({ ...settings, timePreferences: { ...prefs, [view]: { ...(prefs[view] as WeekViewPreferences), visibleDays: value } } });
  };

  return (
    <div className="space-y-6">

      {/* Day view */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Day view</p>
        <TimePicker label="From" value={prefs.dayView.startTime} onChange={(v) => updateTime('dayView', 'startTime', v)} />
        <TimePicker label="To"   value={prefs.dayView.endTime}   onChange={(v) => updateTime('dayView', 'endTime',   v)} />
      </div>

      {/* Week view */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Week view</p>
        <TimePicker label="From" value={prefs.weekView.startTime} onChange={(v) => updateTime('weekView', 'startTime', v)} />
        <TimePicker label="To"   value={prefs.weekView.endTime}   onChange={(v) => updateTime('weekView', 'endTime',   v)} />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Visible days</p>
        <DayPicker value={prefs.weekView.visibleDays} onChange={(v) => updateDays('weekView', v)} />
      </div>

      {/* Explorer view */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Explorer</p>
        <TimePicker label="From" value={prefs.explorerView.startTime} onChange={(v) => updateTime('explorerView', 'startTime', v)} />
        <TimePicker label="To"   value={prefs.explorerView.endTime}   onChange={(v) => updateTime('explorerView', 'endTime',   v)} />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Visible days</p>
        <DayPicker value={prefs.explorerView.visibleDays} onChange={(v) => updateDays('explorerView', v)} />
      </div>

    </div>
  );
}
