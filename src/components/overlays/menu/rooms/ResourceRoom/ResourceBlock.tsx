import { useState } from 'react';
import type { Resource, ResourceType, ContactMeta, HomeMeta, VehicleMeta, AccountMeta, DocMeta } from '../../../../../types/resource';
import { ResourceBlockExpanded } from './ResourceBlockExpanded';
import { resolveIcon } from '../../../../../constants/iconMap';

interface ResourceBlockProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
}

const TYPE_BADGE: Record<ResourceType, { label: string; cls: string }> = {
  contact:   { label: 'Contact',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  home:      { label: 'Home',      cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  vehicle:   { label: 'Vehicle',   cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  account:   { label: 'Account',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  inventory: { label: 'Inventory', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  doc:       { label: 'Doc',       cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
};

export function ResourceBlock({ resource, onEdit }: ResourceBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const badge = TYPE_BADGE[resource.type];
  const isContact = resource.type === 'contact';
  const isHome = resource.type === 'home';
  const isVehicle = resource.type === 'vehicle';
  const contactGroups = isContact
    ? ((resource.meta as ContactMeta).groups ?? [])
    : [];
  const homeAddress = isHome
    ? ((resource.meta as HomeMeta).address ?? '')
    : '';
  const vehicleMileage = isVehicle
    ? ((resource.meta as VehicleMeta).mileage ?? null)
    : null;
  const isInventory = resource.type === 'inventory';
  const isDoc = resource.type === 'doc';
  const isAccount = resource.type === 'account';
  const accountBalance = isAccount
    ? ((resource.meta as AccountMeta).balance ?? null)
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Collapsed row */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
      >
        {/* Icon */}
        <span className="text-xl shrink-0 leading-none">
          {resolveIcon(resource.icon)}
        </span>

        {/* Name */}
        <span className="flex-1 text-sm text-gray-800 dark:text-gray-100 truncate min-w-0">
          {resource.name}
        </span>

        {/* Right side: group pills for contacts, address for homes, type badge for others */}
        {isContact ? (
          <div className="flex items-center gap-1 shrink-0 max-w-[45%] overflow-hidden">
            {contactGroups.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap"
              >
                {g}
              </span>
            ))}
          </div>
        ) : isHome && homeAddress ? (
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[40%] shrink-0">
            {homeAddress}
          </span>
        ) : isVehicle && vehicleMileage != null ? (
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            {vehicleMileage.toLocaleString()} km
          </span>
        ) : isAccount && accountBalance != null && accountBalance !== 0 ? (
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : isInventory ? null : isDoc ? (
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 capitalize">
            {(resource.meta as DocMeta).docType ?? ''}
          </span>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
        )}

        {/* Chevron */}
        <span className="text-gray-400 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <ResourceBlockExpanded
          resource={resource}
          onClose={() => setExpanded(false)}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}
