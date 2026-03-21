import { XPBarVisual } from '../shared/XPBarVisual';

interface XPBarProps {
  displayName: string;
  level: number;
  current: number;
  max: number;
}

export function XPBar({ displayName, level, current, max }: XPBarProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-800 truncate">{displayName}</span>
        <span className="text-xs text-gray-500 shrink-0 ml-1">Lv {level + 1}</span>
      </div>
      <XPBarVisual current={current} max={max} />
    </div>
  );
}
