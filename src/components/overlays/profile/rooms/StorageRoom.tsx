/** Reads all localStorage keys and shows usage summary */
export function StorageRoom() {
  const entries: { key: string; bytes: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const val = localStorage.getItem(key) ?? '';
    entries.push({ key, bytes: new Blob([val]).size });
  }

  const totalBytes = entries.reduce((sum, e) => sum + e.bytes, 0);
  const fmtKB = (b: number) => (b / 1024).toFixed(1) + ' KB';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-700">Storage</h3>
        <p className="text-xs text-gray-400">Local device storage (read-only)</p>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-sm text-gray-600">{fmtKB(totalBytes)}</span>
        </div>
        {entries
          .sort((a, b) => b.bytes - a.bytes)
          .map((e) => (
            <div key={e.key} className="flex items-center justify-between px-4 py-2">
              <span className="text-xs text-gray-600 max-w-[70%] truncate">{e.key}</span>
              <span className="text-xs text-gray-400">{fmtKB(e.bytes)}</span>
            </div>
          ))}
        {entries.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">No data stored yet.</p>
        )}
      </div>
    </div>
  );
}
