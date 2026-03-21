import { useUserStore } from '../../../../../../stores/useUserStore';
import { ShoppingItemBlock } from './ShoppingItemBlock';

export function ShoppingSection() {
  const user = useUserStore((s) => s.user);
  const shoppingLists = user?.lists.shoppingLists ?? [];

  if (shoppingLists.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No shopping lists yet.</p>
        <button type="button" className="mt-2 text-xs text-blue-500 font-medium">
          + Add List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {shoppingLists.map((list) => (
        <div key={list.id}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {list.name}
            </h3>
            <button type="button" className="text-xs text-blue-500 font-medium">
              + Add
            </button>
          </div>
          {list.items.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-1">Empty list.</p>
          ) : (
            <div className="space-y-1.5">
              {list.items.map((item) => (
                <ShoppingItemBlock
                  key={item.id}
                  item={item}
                  onToggle={(_id) => {
                    /* BUILD-TIME: toggle via store action */
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
