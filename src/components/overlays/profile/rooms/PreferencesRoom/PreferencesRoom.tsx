import { CoachToneSelector } from './CoachToneSelector';
import { ThemeModeToggle } from './ThemeModeToggle';
import { TimeViewFilterSettings } from './TimeViewFilterSettings';
import { DisplayNameChange } from './DisplayNameChange';

export function PreferencesRoom() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Preferences</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <DisplayNameChange />
        <CoachToneSelector />
        <TimeViewFilterSettings />
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Character</p>
          <p className="text-sm text-gray-400">Character selection — future chapter stub</p>
        </div>
        <ThemeModeToggle />
      </div>
    </div>
  );
}
