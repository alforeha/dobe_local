import { CoachToneSelector } from './CoachToneSelector';
import { TimeViewFilterSettings } from './TimeViewFilterSettings';
import { DisplayNameChange } from './DisplayNameChange';

export function PreferencesRoom() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-700">Preferences</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <CoachToneSelector />
        <TimeViewFilterSettings />
        <DisplayNameChange />
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Character</p>
          <p className="text-sm text-gray-400">Character selection — future chapter stub</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Theme</p>
          <p className="text-sm text-gray-400">Theme overrides — stub</p>
        </div>
      </div>
    </div>
  );
}
