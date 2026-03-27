import { useState } from 'react';
import type { Act, Chain, Quest } from '../../../../../types';
import { IconPicker } from '../../../../shared/IconPicker';
import {
  GoalField,
  GoalPageShell,
  GoalProgressBar,
  GoalSection,
  GoalStateBadge,
} from './GoalEditorShared';
import {
  createBlankChain,
  getQuestUnlockMode,
  normalizeActForSave,
  setQuestUnlockMode,
} from './goalEditorUtils';
import { resolveIcon } from '../../../../../constants/iconMap';

type WoopTab = 'wish' | 'outcome' | 'obstacle' | 'plan';

interface GoalChainPageProps {
  act: Act;
  chainIdx: number | null;
  readOnly: boolean;
  onBack: () => void;
  onSave: (act: Act) => void;
  onOpenQuest: (act: Act, chainIdx: number, questIdx: number | null) => void;
}

export function GoalChainPage({
  act,
  chainIdx,
  readOnly,
  onBack,
  onSave,
  onOpenQuest,
}: GoalChainPageProps) {
  const existingChain = chainIdx !== null ? act.chains[chainIdx] : null;
  const [draft, setDraft] = useState<Chain>(
    existingChain ? { ...existingChain } : createBlankChain(act.chains.length),
  );
  const [activeTab, setActiveTab] = useState<WoopTab>('wish');
  const [expandedQuestIdx, setExpandedQuestIdx] = useState<number | null>(null);
  const [draggingQuestIdx, setDraggingQuestIdx] = useState<number | null>(null);

  function persist(updatedChain: Chain): { act: Act; index: number } {
    const updatedChains = [...act.chains];
    const nextIndex = chainIdx ?? updatedChains.length;
    updatedChains[nextIndex] = updatedChain;
    const updatedAct = normalizeActForSave({ ...act, chains: updatedChains });
    return { act: updatedAct, index: nextIndex };
  }

  function saveAndExit() {
    onSave(persist(draft).act);
  }

  function openQuest(questIdx: number | null) {
    const next = persist(draft);
    onOpenQuest(next.act, next.index, questIdx);
  }

  function updateQuestAt(index: number, updater: (quest: Quest) => Quest) {
    setDraft((current) => ({
      ...current,
      quests: current.quests.map((quest, questIdx) => questIdx === index ? updater(quest) : quest),
    }));
  }

  function moveQuest(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    setDraft((current) => {
      const quests = [...current.quests];
      const [moved] = quests.splice(fromIdx, 1);
      quests.splice(toIdx, 0, moved);
      return { ...current, quests };
    });
    setExpandedQuestIdx(toIdx);
  }

  const footer = (
    <>
      <button
        type="button"
        onClick={onBack}
        className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        Back
      </button>
      <button
        type="button"
        disabled={readOnly}
        onClick={saveAndExit}
        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Save
      </button>
    </>
  );

  return (
    <GoalPageShell
      title={draft.name || 'Chain'}
      subtitle={readOnly ? 'Read-only chain' : 'WOOP chain editor'}
      onBack={onBack}
      footer={footer}
    >
      <GoalSection title="Chain">
        <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-start">
          <IconPicker value={draft.icon} onChange={(icon) => setDraft((current) => ({ ...current, icon }))} align="left" />
          <GoalField label="Name">
            <input
              type="text"
              value={draft.name}
              disabled={readOnly}
              onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </GoalField>
          <div className="flex items-start justify-end">
            <GoalStateBadge state={draft.completionState} />
          </div>
        </div>
        <GoalField label="Description">
          <textarea
            value={draft.description}
            disabled={readOnly}
            onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
            rows={4}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>
      </GoalSection>

      <GoalSection title="WOOP">
        <div className="grid gap-2 md:grid-cols-4">
          {(['wish', 'outcome', 'obstacle', 'plan'] as WoopTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold uppercase tracking-wide ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white'
                  : 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'
              }`}
            >
              {tab === 'wish' ? 'W' : tab === 'outcome' ? 'O' : tab === 'obstacle' ? 'O' : 'P'}
            </button>
          ))}
        </div>

        {activeTab !== 'plan' ? (
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 p-6 dark:from-emerald-950/40 dark:via-sky-950/30 dark:to-amber-950/20">
            <textarea
              value={activeTab === 'wish' ? draft.wish : activeTab === 'outcome' ? draft.outcome : draft.obstacle}
              disabled={readOnly}
              onChange={(e) => {
                const value = e.target.value;
                setDraft((current) => ({
                  ...current,
                  wish: activeTab === 'wish' ? value : current.wish,
                  outcome: activeTab === 'outcome' ? value : current.outcome,
                  obstacle: activeTab === 'obstacle' ? value : current.obstacle,
                }));
              }}
              placeholder={
                activeTab === 'wish'
                  ? 'What do you want to achieve?'
                  : activeTab === 'outcome'
                    ? 'What does success look like?'
                    : 'What might get in the way?'
              }
              rows={10}
              className="min-h-[18rem] w-full resize-none rounded-2xl bg-white/70 px-4 py-4 text-lg text-gray-800 outline-none dark:bg-gray-900/60 dark:text-gray-100"
            />
          </div>
        ) : (
          <div className="grid min-h-[22rem] gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 dark:from-emerald-950/40 dark:to-emerald-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Wish</p>
              <p className="mt-2 line-clamp-6 text-sm text-gray-700 dark:text-gray-200">{draft.wish || 'No wish written yet.'}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 p-4 dark:from-sky-950/40 dark:to-sky-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Outcome</p>
              <p className="mt-2 line-clamp-6 text-sm text-gray-700 dark:text-gray-200">{draft.outcome || 'No outcome written yet.'}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 dark:from-amber-950/40 dark:to-amber-900/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Obstacle</p>
              <p className="mt-2 line-clamp-6 text-sm text-gray-700 dark:text-gray-200">{draft.obstacle || 'No obstacle written yet.'}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Plan / Quests</p>
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => openQuest(null)}
                    className="text-xs font-medium text-emerald-600"
                  >
                    + Add Quest
                  </button>
                ) : null}
              </div>
              <div className="space-y-2">
                {draft.quests.map((quest, questIdx) => (
                  <div
                    key={`${quest.name}-${questIdx}`}
                    draggable={!readOnly}
                    onDragStart={() => setDraggingQuestIdx(questIdx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggingQuestIdx === null) return;
                      moveQuest(draggingQuestIdx, questIdx);
                      setDraggingQuestIdx(null);
                    }}
                    className="rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={readOnly}
                        className="cursor-grab rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 disabled:cursor-default dark:border-gray-600"
                      >
                        ::
                      </button>
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                        {quest.name || `Quest ${questIdx + 1}`}
                      </p>
                    </div>
                    <div className="mt-2">
                      <select
                        value={getQuestUnlockMode(quest)}
                        disabled={readOnly}
                        onChange={(e) => updateQuestAt(questIdx, (current) => setQuestUnlockMode(current, e.target.value as 'immediate' | 'previousComplete' | 'manual'))}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="previousComplete">After previous</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </GoalSection>

      <GoalSection title={`Quests (${draft.quests.length})`}>
        <div className="space-y-3">
          {draft.quests.map((quest, questIdx) => {
            const expanded = expandedQuestIdx === questIdx;
            return (
              <div key={`${quest.name}-${questIdx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setExpandedQuestIdx((current) => current === questIdx ? null : questIdx)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {quest.name || `Quest ${questIdx + 1}`}
                      </p>
                      <GoalStateBadge state={quest.completionState} />
                    </div>
                    <div className="mt-1">
                      <GoalProgressBar value={quest.progressPercent} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{expanded ? 'Hide' : 'Show'}</span>
                </button>
                {expanded ? (
                  <div className="space-y-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {quest.description || 'No description yet.'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{resolveIcon(quest.icon)}</span>
                      <span>{quest.timely.conditionType}</span>
                      <span>•</span>
                      <span>{quest.specific.targetValue}{quest.specific.unit ? ` ${quest.specific.unit}` : ''}</span>
                    </div>
                    {!readOnly ? (
                      <button
                        type="button"
                        onClick={() => openQuest(questIdx)}
                        className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Edit Quest
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
          {!readOnly ? (
            <button
              type="button"
              onClick={() => openQuest(null)}
              className="w-full rounded-2xl border border-dashed border-emerald-400 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
            >
              + Add Quest
            </button>
          ) : null}
        </div>
      </GoalSection>
    </GoalPageShell>
  );
}
