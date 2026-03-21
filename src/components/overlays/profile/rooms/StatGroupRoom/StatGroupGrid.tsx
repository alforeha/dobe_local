import { useState } from 'react';
import type { StatGroupKey } from '../../../../../types/user';
import type { TalentGroupStats } from '../../../../../types/stats';
import { StatIcon } from '../../../../shared/StatIcon';
import { StatCubePopup } from './StatCubePopup';
import { StatIconPopup } from './StatIconPopup';

interface StatGroupGridProps {
  talents: Record<StatGroupKey, TalentGroupStats>;
  talentPoints: number;
}

const STAT_ORDER: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

// BUILD 91 days ending today
function buildDates(): string[] {
  const dates: string[] = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DATES = buildDates();

interface CubeProps {
  date: string;
  stat: StatGroupKey;
  /** BUILD-TIME: no per-day stat breakdown in current store — render as grey */
  active?: boolean;
}

function StatCube({ date, stat, active }: CubeProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className={`h-4 w-4 rounded-sm ${active ? 'bg-indigo-400' : 'bg-gray-200 dark:bg-gray-600'} hover:ring-1 hover:ring-indigo-400`}
        onClick={() => setOpen((v) => !v)}
        aria-label={`${stat} ${date}`}
      />
      {open && (
        <StatCubePopup
          date={date}
          stat={stat}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export function StatGroupGrid({ talents, talentPoints }: StatGroupGridProps) {
  const [openIcon, setOpenIcon] = useState<StatGroupKey | null>(null);

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {STAT_ORDER.map((stat) => (
        <div key={stat} className="flex items-center gap-2 py-2">
          {/* Fixed left column — stat icon */}
          <div className="relative w-16 shrink-0">
            <StatIcon
              stat={stat}
              value={talents[stat]?.statPoints ?? 0}
              onClick={() => setOpenIcon(openIcon === stat ? null : stat)}
            />
            {openIcon === stat && (
              <StatIconPopup
                stat={stat}
                talentData={talents[stat]}
                talentPoints={talentPoints}
                onClose={() => setOpenIcon(null)}
              />
            )}
          </div>
          {/* Horizontal scroll — 91-day cubes */}
          <div className="flex gap-0.5 overflow-x-auto py-1">
            {DATES.map((date) => (
              <StatCube key={date} date={date} stat={stat} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
