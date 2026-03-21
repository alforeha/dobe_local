/** BUILD-TIME STUB: ChainPopup — Quest & Milestone management */
interface ChainPopupProps {
  chainName: string;
  onClose: () => void;
}

export function ChainPopup({ chainName, onClose }: ChainPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 mx-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-800 truncate flex-1 mr-2">{chainName}</p>
          <button type="button" onClick={onClose} className="text-gray-400 text-lg leading-none shrink-0">✕</button>
        </div>
        <p className="text-xs text-yellow-700 bg-yellow-50 rounded p-2">
          ⚠️ BUILD-TIME STUB — Quest &amp; Milestone management coming
        </p>
      </div>
    </div>
  );
}
