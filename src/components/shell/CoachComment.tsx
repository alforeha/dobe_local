/** Passive ambient coach comment area in the footer. */
export function CoachComment() {
  return (
    <div className="flex-1 min-w-0 px-2">
      <p className="truncate text-xs text-gray-400 italic">
        {/* Coach reactive messages surface here — BUILD-time logic */}
        Keep going — you're doing great!
      </p>
    </div>
  );
}
