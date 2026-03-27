import { useMemo, useState } from 'react';
import type { Act } from '../../../../../types';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { IconPicker } from '../../../../shared/IconPicker';
import { GoalField, GoalPageShell, GoalProgressBar, GoalSection, GoalStateBadge } from './GoalEditorShared';
import { getActToggle, getChainProgressPercent, getUnlockConditionLabel, normalizeActForSave } from './goalEditorUtils';
import { resolveIcon } from '../../../../../constants/iconMap';
import { starterTaskTemplates } from '../../../../../coach/StarterQuestLibrary';

interface GoalActPageProps {
  act: Act;
  readOnly: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: (act: Act) => void;
  onOpenChain: (act: Act, chainIdx: number | null) => void;
}

export function GoalActPage({
  act,
  readOnly,
  onBack,
  onCancel,
  onSave,
  onOpenChain,
}: GoalActPageProps) {
  const [draft, setDraft] = useState<Act>(normalizeActForSave(act));
  const [expandedChainIdx, setExpandedChainIdx] = useState<number | null>(null);
  const scheduleTaskTemplates = useScheduleStore((state) => state.taskTemplates);
  const resources = useResourceStore((state) => state.resources);

  function updateDraft(partial: Partial<Act>) {
    setDraft((current) => normalizeActForSave({ ...current, ...partial }));
  }

  function updateToggle<K extends keyof NonNullable<Act['toggle']>>(key: K, value: NonNullable<Act['toggle']>[K]) {
    const nextToggle = { ...getActToggle(draft), [key]: value };
    updateDraft({ toggle: nextToggle });
  }

  function commitAndOpenChain(chainIdx: number | null) {
    const normalized = normalizeActForSave(draft);
    setDraft(normalized);
    onOpenChain(normalized, chainIdx);
  }

  const activeChain = useMemo(() => {
    const activeChainIndex = getActToggle(draft).activeChainIndex;
    return draft.chains[activeChainIndex] ?? null;
  }, [draft]);

  const commitmentSummary = useMemo(() => {
    const taskTemplateRefs = Array.from(new Set(
      (activeChain?.quests ?? []).flatMap((quest) => quest.measurable.taskTemplateRefs ?? []),
    ));
    const resourceRefs = Array.from(new Set(
      (activeChain?.quests ?? []).flatMap((quest) => {
        const refs: string[] = [];
        if (quest.measurable.resourceRef) refs.push(quest.measurable.resourceRef);
        if (quest.specific.resourceRef) refs.push(quest.specific.resourceRef);
        return refs;
      }),
    ));

    const coachTemplateMap = new Map(
      starterTaskTemplates
        .filter((template): template is typeof template & { id: string } => !!template.id)
        .map((template) => [template.id, template]),
    );

    return {
      templates: taskTemplateRefs.map((ref) => ({
        ref,
        template: scheduleTaskTemplates[ref] ?? coachTemplateMap.get(ref) ?? null,
      })),
      resources: resourceRefs
        .map((ref) => resources[ref])
        .filter((resource): resource is NonNullable<typeof resource> => !!resource),
    };
  }, [activeChain, resources, scheduleTaskTemplates]);

  const footer = (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={readOnly}
        onClick={() => onSave(normalizeActForSave(draft))}
        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Save
      </button>
    </>
  );

  return (
    <GoalPageShell
      title={draft.name || 'Act'}
      subtitle={readOnly ? 'Read-only adventure' : 'Habitat act editor'}
      onBack={onBack}
      footer={footer}
    >
      <GoalSection title="Act">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="shrink-0">
            <IconPicker
              value={draft.icon}
              onChange={(icon) => updateDraft({ icon })}
              align="left"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <GoalField label="Name">
                  <input
                    type="text"
                    value={draft.name}
                    disabled={readOnly}
                    onChange={(e) => updateDraft({ name: e.target.value })}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                  />
                </GoalField>
              </div>
              <div className="shrink-0">
                <GoalStateBadge state={draft.completionState} />
              </div>
            </div>
          </div>
        </div>
        <GoalField label="Description">
          <textarea
            value={draft.description}
            disabled={readOnly}
            onChange={(e) => updateDraft({ description: e.target.value })}
            rows={4}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>
      </GoalSection>

      <GoalSection title="Chains">
        <div className="space-y-3">
          {draft.chains.map((chain, chainIdx) => {
            const isExpanded = expandedChainIdx === chainIdx;
            const progress = getChainProgressPercent(chain);
            const isActive = getActToggle(draft).activeChainIndex === chainIdx;
            return (
              <div key={`${chain.name}-${chainIdx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setExpandedChainIdx((current) => current === chainIdx ? null : chainIdx)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="text-xl">{resolveIcon(chain.icon)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {chain.name || `Chain ${chainIdx + 1}`}
                      </p>
                      {isActive ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1">
                      <GoalProgressBar value={progress} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{isExpanded ? 'Hide' : 'Show'}</span>
                </button>
                {isExpanded ? (
                  <div className="space-y-3 border-t border-gray-200 px-4 py-3 text-sm dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300">
                      {chain.quests.length} quests • {chain.completionState} • {getUnlockConditionLabel(chain.unlockCondition)}
                    </p>
                    <div className="flex gap-2">
                      {!readOnly ? (
                        <button
                          type="button"
                          onClick={() => commitAndOpenChain(chainIdx)}
                          className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          Edit Chain
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => commitAndOpenChain(chainIdx)}
                        className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white"
                      >
                        Open Chain
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
          {!readOnly ? (
            <button
              type="button"
              onClick={() => commitAndOpenChain(null)}
              className="w-full rounded-2xl border border-dashed border-emerald-400 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
            >
              + Add Chain
            </button>
          ) : null}
        </div>
      </GoalSection>

      <GoalSection title="Act Area">
        <GoalField label="Accountability">
          <div className="rounded-xl bg-gray-100 px-3 py-3 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            Share progress with contacts — coming in a future update
          </div>
        </GoalField>

        <GoalField
          label="Commitment"
          hint={activeChain ? `Tracking the active chain: ${activeChain.name || 'Unnamed chain'}` : 'No active chain selected'}
        >
          <div className="space-y-3 rounded-xl border border-gray-200 px-3 py-3 dark:border-gray-700">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tasks
              </p>
              {commitmentSummary.templates.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No measurable task templates on the active chain yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {commitmentSummary.templates.map(({ ref, template }) => (
                    <div
                      key={ref}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                    >
                      <span>{resolveIcon(template?.icon ?? 'quest')}</span>
                      <span>{template?.name ?? ref}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Resources
              </p>
              {commitmentSummary.resources.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No measurable resources on the active chain yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {commitmentSummary.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sm text-sky-800 dark:bg-sky-950/30 dark:text-sky-200"
                    >
                      <span>{resolveIcon(resource.icon)}</span>
                      <span>{resource.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GoalField>


        <div className="grid gap-4 md:grid-cols-2">
          <GoalField label="Auto-advance chains">
            <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-200">Enabled</span>
              <input
                type="checkbox"
                checked={getActToggle(draft).autoAdvanceChains}
                disabled={readOnly}
                onChange={(e) => updateToggle('autoAdvanceChains', e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
            </label>
          </GoalField>

          <GoalField label="Sleep with chain">
            <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-200">Enabled</span>
              <input
                type="checkbox"
                checked={getActToggle(draft).sleepWithChain}
                disabled={readOnly}
                onChange={(e) => updateToggle('sleepWithChain', e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
            </label>
          </GoalField>
        </div>

        <GoalField label="Active chain">
          <select
            value={String(getActToggle(draft).activeChainIndex)}
            disabled={readOnly || draft.chains.length === 0}
            onChange={(e) => updateToggle('activeChainIndex', parseInt(e.target.value, 10) || 0)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            {draft.chains.map((chain, idx) => (
              <option key={`${chain.name}-${idx}`} value={idx}>
                {chain.name || `Chain ${idx + 1}`}
              </option>
            ))}
          </select>
        </GoalField>
      </GoalSection>
    </GoalPageShell>
  );
}
