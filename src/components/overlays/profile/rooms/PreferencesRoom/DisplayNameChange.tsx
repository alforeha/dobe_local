import { useState, useMemo } from 'react';
import { useUserStore } from '../../../../../stores/useUserStore';

/** Annual gate: User.system.wrappedAnchor gates display name change (D31).
 *  Auto-saves on blur or Enter key. */
export function DisplayNameChange() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const displayName = user?.system.displayName ?? '';
  const [draft, setDraft] = useState(displayName);

  const wrappedAnchor = user?.system.wrappedAnchor;
  const canChange = useMemo(() => {
    if (!wrappedAnchor) return true;
    const diffDays = (new Date().getTime() - new Date(wrappedAnchor).getTime()) / 86_400_000;
    return diffDays >= 365;
  }, [wrappedAnchor]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!user || !trimmed || trimmed === displayName) return;
    setUser({
      ...user,
      system: { ...user.system, displayName: trimmed, wrappedAnchor: new Date().toISOString() },
    });
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Your name
      </label>
      {canChange ? (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
          maxLength={30}
          placeholder="Enter your name"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-base font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      ) : (
        <>
          <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{displayName}</p>
          <p className="text-xs text-gray-400 mt-1">Can be changed once per year.</p>
        </>
      )}
    </div>
  );
}
