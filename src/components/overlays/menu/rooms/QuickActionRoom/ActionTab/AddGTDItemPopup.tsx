import { useState } from 'react';
import { PopupShell } from '../../../../../shared/popups/PopupShell';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { addManualGTDItem } from '../../../../../../engine/listsEngine';

interface AddGTDItemPopupProps {
  onClose: () => void;
}

export function AddGTDItemPopup({ onClose }: AddGTDItemPopupProps) {
  const user = useUserStore((s) => s.user);
  const resources = useResourceStore((s) => s.resources);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [resourceRef, setResourceRef] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // Build a flat list of all user resources for the dropdown
  const allResourceIds = user
    ? [
        ...user.resources.contacts,
        ...user.resources.homes,
        ...user.resources.vehicles,
        ...user.resources.accounts,
        ...user.resources.inventory,
        ...user.resources.docs,
      ]
    : [];
  const resourceOptions = allResourceIds
    .map((id) => resources[id])
    .filter(Boolean);

  function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }
    if (!user) return;

    addManualGTDItem(
      {
        title: trimmedTitle,
        note: note.trim() || null,
        resourceRef: resourceRef || null,
        dueDate: dueDate || null,
      },
      user,
    );
    onClose();
  }

  return (
    <PopupShell title="Add GTD Item" onClose={onClose}>
      <div className="space-y-3">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="What needs to be done?"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Note <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional context…"
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* Resource link */}
        {resourceOptions.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Link to resource <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={resourceRef}
              onChange={(e) => setResourceRef(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">— None —</option>
              {resourceOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Due date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Due date <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </PopupShell>
  );
}
