import { useSystemStore } from '../../../../../stores/useSystemStore';

export function ThemeModeToggle() {
  const mode = useSystemStore((s) => s.settings?.displayPreferences?.mode ?? 'dark');
  const setThemeMode = useSystemStore((s) => s.setThemeMode);

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Appearance
      </p>
      <div className="flex gap-2">
        {(['light', 'dark'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setThemeMode(m)}
            className={`rounded px-3 py-1.5 text-sm capitalize ${
              mode === m
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {m === 'light' ? '☀ Light' : '🌙 Dark'}
          </button>
        ))}
      </div>
    </div>
  );
}
