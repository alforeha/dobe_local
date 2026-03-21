import { useState, useRef } from 'react';
import type { Resource, ContactMeta, HomeMeta, VehicleMeta, AccountMeta, InventoryMeta, DocMeta, ResourceType } from '../../../../../types/resource';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../stores/useUserStore';
import { storageSet } from '../../../../../storage';
import { ContactMetaView } from './contact/ContactMetaView';
import { HomeMetaView } from './home/HomeMetaView';
import { VehicleMetaView } from './vehicle/VehicleMetaView';
import { AccountMetaView } from './account/AccountMetaView';
import { InventoryMetaView } from './inventory/InventoryMetaView';
import { DocMetaView } from './doc/DocMetaView';

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

function daysUntil(isoDate: string): number | null {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  const target = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  if (isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
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

  // Build GTD status badges
  const badges: { icon: string; label: string; color: string }[] = [];

  if (resource.type === 'contact') {
    const meta = resource.meta as ContactMeta;
    if (meta.info?.birthday) {
      const d = daysUntilAnnual(meta.info.birthday);
      if (d !== null && d <= 14) {
        badges.push({ icon: '🎂', label: d === 0 ? 'Birthday today!' : `Birthday in ${d}d`, color: 'amber' });
      }
    }
  }

  if (resource.type === 'vehicle') {
    const meta = resource.meta as VehicleMeta;
    if (meta.insuranceExpiry) {
      const d = daysUntil(meta.insuranceExpiry);
      if (d !== null && d <= 30) {
        badges.push({ icon: '🛡️', label: d <= 0 ? 'Insurance expired!' : `Insurance expires in ${d}d`, color: 'red' });
      }
    }
    if (meta.serviceNextDate) {
      const d = daysUntil(meta.serviceNextDate);
      if (d !== null && d <= 14) {
        badges.push({ icon: '🔧', label: d <= 0 ? 'Service overdue!' : `Service in ${d}d`, color: 'orange' });
      }
    }
  }

  if (resource.type === 'account') {
    const meta = resource.meta as AccountMeta;
    if (meta.dueDate) {
      const d = daysUntil(meta.dueDate);
      if (d !== null && d <= 7) {
        badges.push({ icon: '💳', label: d <= 0 ? 'Payment overdue!' : `Payment due in ${d}d`, color: 'red' });
      }
    }
  }

  if (resource.type === 'inventory') {
    const meta = resource.meta as InventoryMeta;
    const threshold = meta.lowStockThreshold ?? 0;
    if (threshold > 0 && meta.items) {
      const lowItems = meta.items.filter((item) => (item.quantity ?? 0) <= threshold);
      if (lowItems.length > 0) {
        badges.push({ icon: '📦', label: `${lowItems.length} item${lowItems.length > 1 ? 's' : ''} low stock`, color: 'amber' });
      }
    }
  }

  if (resource.type === 'doc') {
    const meta = resource.meta as DocMeta;
    if (meta.expiryDate) {
      const d = daysUntil(meta.expiryDate);
      if (d !== null && d <= 30) {
        badges.push({ icon: '📄', label: d <= 0 ? 'Document expired!' : `Expires in ${d}d`, color: 'red' });
      }
    }
  }

  const colorMap: Record<string, string> = {
    amber: 'text-amber-700 bg-amber-50',
    red:   'text-red-700 bg-red-50',
    orange: 'text-orange-700 bg-orange-50',
  };

  let metaView: React.ReactNode = null;
  switch (resource.type) {
    case 'contact':
      metaView = <ContactMetaView meta={resource.meta as ContactMeta} />;
      break;
    case 'home':
      metaView = <HomeMetaView meta={resource.meta as HomeMeta} />;
      break;
    case 'vehicle':
      metaView = <VehicleMetaView meta={resource.meta as VehicleMeta} />;
      break;
    case 'account':
      metaView = <AccountMetaView meta={resource.meta as AccountMeta} />;
      break;
    case 'inventory':
      metaView = <InventoryMetaView meta={resource.meta as InventoryMeta} />;
      break;
    case 'doc':
      metaView = <DocMetaView meta={resource.meta as DocMeta} />;
      break;
    default:
      metaView = (
        <p className="text-xs text-gray-400 italic mb-2">
          {resource.description || 'No details yet.'}
        </p>
      );
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

        {/* GTD status badges */}
        {badges.length > 0 && (
          <div className="flex flex-col gap-1 mb-2">
            {badges.map((b, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${colorMap[b.color] ?? 'text-gray-600 bg-gray-100'}`}>
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Type-specific meta view */}
        {metaView}

        {/* Actions: Edit (all types) + Delete (all types) */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => onEdit(resource)}
            className="text-xs font-medium text-blue-500 hover:text-blue-600"
          >
            Edit
          </button>
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