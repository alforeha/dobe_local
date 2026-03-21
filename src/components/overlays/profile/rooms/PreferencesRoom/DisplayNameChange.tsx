import { useState } from 'react';
import { useUserStore } from '../../../../../stores/useUserStore';

/** Annual gate: User.system.wrappedAnchor gates display name change (D31) */
export function DisplayNameChange() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const displayName = user?.system.displayName ?? '';
  const wrappedAnchor = user?.system.wrappedAnchor;

  const canChange = (() => {
    if (!wrappedAnchor) return true;
    const anchor = new Date(wrappedAnchor);
    const now = new Date();
    const diffMs = now.getTime() - anchor.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 365;
  })();

  const handleSave = () => {
    if (!user || !draft.trim()) return;
    setUser({
      ...user,
      system: { ...user.system, displayName: draft.trim(), wrappedAnchor: new Date().toISOString() },
    });
    setEditing(false);
  };

  if (!canChange) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Display name</p>
        <p className="text-sm text-gray-700">{displayName}</p>
        <p className="text-xs text-gray-400 mt-1">Can be changed once per year.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Display name</p>
      {editing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={30}
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            autoFocus
          />
          <button type="button" className="text-sm text-indigo-600 hover:underline" onClick={handleSave}>Save</button>
          <button type="button" className="text-sm text-gray-400 hover:underline" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">{displayName}</p>
          <button
            type="button"
            className="text-xs text-indigo-500 hover:underline"
            onClick={() => { setDraft(displayName); setEditing(true); }}
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
