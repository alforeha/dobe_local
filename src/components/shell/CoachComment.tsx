import { useMemo } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { ribbet } from '../../coach/ribbet';

const FALLBACK = "Keep going — you're doing great!";

/** Passive ambient coach comment area in the footer. */
export function CoachComment() {
  const user = useUserStore((s) => s.user);
  const comment = useMemo(() => (user ? ribbet(user) : FALLBACK), [user]);

  return (
    <div className="flex-1 min-w-0 px-2">
      <p className="truncate text-xs text-gray-400 italic">
        {comment}
      </p>
    </div>
  );
}
