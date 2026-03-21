import { useScheduleStore } from '../../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { FavouriteTaskBlock } from './FavouriteTaskBlock';

export function FavouritesSection() {
  const user = useUserStore((s) => s.user);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  const favouritesList = user?.lists.favouritesList ?? [];
  const entries = favouritesList
    .map((key) => ({ key, template: taskTemplates[key] }))
    .filter((entry) => Boolean(entry.template));

  return (
    <div>
      <div className="mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Favourites
        </h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-gray-400 py-2 text-center">No favourites.</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map(({ key, template }) => (
            <FavouriteTaskBlock key={key} templateKey={key} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
