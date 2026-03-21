import { useUserStore } from '../../stores/useUserStore';

export function BoostRow() {
  const user = useUserStore((s) => s.user);
  const streak = user?.progression?.stats?.milestones?.streakCurrent ?? 0;
  const gold = user?.progression?.gold ?? 0;

  return (
    <div className="flex items-center justify-between">
      {/* Left: active boosts (stub) + streak */}
      <div className="flex items-center gap-1">
        {/* Weather region — empty placeholder per spec */}
        <span className="text-xs text-amber-500" title="Streak">🔥 {streak}</span>
      </div>
      {/* Right: gold value */}
      <span className="text-xs font-semibold text-yellow-600">💰 {gold}</span>
    </div>
  );
}
