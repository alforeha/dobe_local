/** BUILD-TIME STUB: ProfileOverlay — Section 4 */
interface ProfileOverlayProps {
  onClose: () => void;
}

export function ProfileOverlay({ onClose }: ProfileOverlayProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white">
      <p className="text-gray-400 text-sm">Profile Overlay — coming soon</p>
      <button type="button" className="mt-4 text-sm text-blue-500" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
