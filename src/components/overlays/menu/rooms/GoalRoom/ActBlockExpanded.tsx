import { useState } from 'react';
import type { Chain } from '../../../../../types';
import { ChainPopup } from './ChainPopup';

interface ActBlockExpandedProps {
  chains: Chain[];
}

export function ActBlockExpanded({ chains }: ActBlockExpandedProps) {
  const [openChain, setOpenChain] = useState<Chain | null>(null);

  if (chains.length === 0) {
    return <p className="text-xs text-gray-400 px-3 pb-3">No chains yet.</p>;
  }

  return (
    <div className="px-3 pb-3 space-y-1">
      {chains.map((chain, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setOpenChain(chain)}
          className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <span className="text-base">{chain.icon || '⛓️'}</span>
          <span className="flex-1 text-sm text-gray-700 truncate">{chain.name}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
              chain.completionState === 'complete'
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {chain.completionState}
          </span>
        </button>
      ))}
      {openChain && (
        <ChainPopup chainName={openChain.name} onClose={() => setOpenChain(null)} />
      )}
    </div>
  );
}
