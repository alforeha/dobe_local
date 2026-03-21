import { useState, useRef } from 'react';
import type { Resource, ContactMeta, ResourceType } from '../../../../../types/resource';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../stores/useUserStore';
import { storageSet } from '../../../../../storage';
import { ContactMetaView } from './contact/ContactMetaView';

interface ResourceBlockExpandedProps {
  resource: Resource;
  onClose: () => void;
  onEdit: (resource: Resource) => void;
}

function daysUntilAnnual(isoDate: string): number | null {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  const parts = isoDate.slice(0, 10).split('-');
  if (parts.length < 3) return null;
  const thisYear = today.getFullYear();
  const candidate = new Date(`${thisYear}-${parts[1]}-${parts[2]}T00:00:00`);
  if (candidate < today) candidate.setFullYear(thisYear + 1);
  return Math.round((candidate.getTime() - today.getTime()) / 86_400_000);
}

const USER_RESOURCE_KEY: Record<ResourceType, 'contacts' | 'homes' | 'vehicles' | 'accounts' | 'inventory' | 'docs'> = {
  contact:   'contacts',
  home:      'homes',
  vehicle:   'vehicles',
  account:   'accounts',
  inventory: 'inventory',
  doc:       'docs',
};

export function ResourceBlockExpanded({ resource, onClose, onEdit }: ResourceBlockExpandedProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeResource = useResourceStore((s) => s.removeResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      resetTimer.current = setTimeout(() => {
        setDeleteConfirm(false);
        resetTimer.current = null;
      }, 3000);
      return;
    }
    // Second tap — confirmed
    if (resetTimer.current) clearTimeout(resetTimer.current);
    removeResource(resource.id);
    if (user) {
      const listKey = USER_RESOURCE_KEY[resource.type];
      const updatedUser = {
        ...user,
        resources: {
          ...user.resources,
          [listKey]: (user.resources[listKey] as string[]).filter((id) => id !== resource.id),
        },
      };
      setUser(updatedUser);
      storageSet('user', updatedUser);
    }
    onClose();
  }

  // Task generation status badge for contact (birthday within 14 days)
  let taskStatus: React.ReactNode = null;
  if (resource.type === 'contact') {
    const meta = resource.meta as ContactMeta;
    if (meta.info?.birthday) {
      const d = daysUntilAnnual(meta.info.birthday);
      if (d !== null && d <= 14) {
        taskStatus = (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2">
            <span>🎂</span>
            <span>
              Birthday GTD task active —{' '}
              {d === 0 ? 'today!' : `in ${d} day${d === 1 ? '' : 's'}`}
            </span>
          </div>
        );
      }
    }
  }

  return (
    <div className="px-3 pb-3">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl shrink-0">{resource.icon || '📦'}</span>
          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
            {resource.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 text-sm leading-none shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Task generation status */}
        {taskStatus}

        {/* Type-specific meta */}
        {resource.type === 'contact' ? (
          <ContactMetaView meta={resource.meta as ContactMeta} />
        ) : (
          <p className="text-xs text-gray-400 italic mb-2">
            {resource.description || 'No details yet.'}
          </p>
        )}

        {/* Actions: Edit (contact only) + Delete (all types) */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
          {resource.type === 'contact' && (
            <button
              type="button"
              onClick={() => onEdit(resource)}
              className="text-xs font-medium text-blue-500 hover:text-blue-600"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className={`text-xs font-medium ml-auto transition-colors ${
              deleteConfirm
                ? 'text-red-600 font-bold'
                : 'text-red-400 hover:text-red-500'
            }`}
          >
            {deleteConfirm ? 'Tap again to confirm delete' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResourceBlockExpanded({ resource, onClose, onEdit }: ResourceBlockExpandedProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeResource = useResourceStore((s) => s.removeResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      resetTimer.current = setTimeout(() => {
        setDeleteConfirm(false);
        resetTimer.current = null;
      }, 3000);
      return;
    }
    // Second tap — confirmed
    if (resetTimer.current) clearTimeout(resetTimer.current);
    removeResource(resource.id);
    if (user) {
      const listKey = TYPE_KEY_MAP[resource.type];
      const updatedUser = {
        ...user,
        resources: {
          ...user.resources,
          [listKey]: (user.resources[listKey] as string[]).filter((id) => id !== resource.id),
        },
      };
      setUser(updatedUser);
      storageSet('user', updatedUser);
    }
    onClose();
  }

  // Task generation status badge for contact
  let taskStatus: React.ReactNode = null;
  if (resource.type === 'contact') {
    const meta = resource.meta as ContactMeta;
    if (meta.info?.birthday) {
      const d = daysUntilAnnual(meta.info.birthday);
      if (d !== null && d <= 14) {
        taskStatus = (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2">
            <span>🎂</span>
            <span>
              Birthday GTD task active —{' '}
              {d === 0 ? 'today!' : `in ${d} day${d === 1 ? '' : 's'}`}
            </span>
          </div>
        );
      }
    }
  }

  return (
    <div className="px-3 pb-3">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl shrink-0">{resource.icon || '📦'}</span>
          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
            {resource.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 text-sm leading-none shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Task generation status */}
        {taskStatus}

        {/* Type-specific meta */}
        {resource.type === 'contact' ? (
          <ContactMetaView meta={resource.meta as ContactMeta} />
        ) : (
          <p className="text-xs text-gray-400 italic mb-2">
            {resource.description || 'No details yet.'}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
          {resource.type === 'contact' && (
            <button
              type="button"
              onClick={() => onEdit(resource)}
              className="text-xs font-medium text-blue-500 hover:text-blue-600"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className={`text-xs font-medium ml-auto transition-colors ${
              deleteConfirm
                ? 'text-red-600 font-bold'
                : 'text-red-400 hover:text-red-500'
            }`}
          >
            {deleteConfirm ? 'Tap again to confirm delete' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
