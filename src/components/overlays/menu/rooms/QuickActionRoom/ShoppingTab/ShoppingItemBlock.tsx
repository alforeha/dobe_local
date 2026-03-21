import type { ShoppingItem } from '../../../../../../types/user';

interface ShoppingItemBlockProps {
  item: ShoppingItem;
  onToggle: (itemId: string) => void;
}

export function ShoppingItemBlock({ item, onToggle }: ShoppingItemBlockProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-lg text-left transition-opacity ${
        item.completed ? 'opacity-50' : ''
      }`}
    >
      <span className="text-base shrink-0">{item.completed ? '☑️' : '⬜'}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate ${
            item.completed ? 'line-through text-gray-400' : 'text-gray-700'
          }`}
        >
          {item.name}
        </p>
        {item.quantity !== null && (
          <p className="text-xs text-gray-400">
            {item.quantity}
            {item.unit ? ` ${item.unit}` : ''}
          </p>
        )}
      </div>
    </button>
  );
}
