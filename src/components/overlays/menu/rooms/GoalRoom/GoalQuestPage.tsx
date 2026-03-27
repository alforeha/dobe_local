import { useMemo, useState } from 'react';
import type {
  Act,
  ExigencyOption,
  Quest,
  RecurrenceFrequency,
  RecurrenceRule,
  StatGroupKey,
  TaskTemplate,
  Weekday,
} from '../../../../../types';
import { IconPicker } from '../../../../shared/IconPicker';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { resolveIcon } from '../../../../../constants/iconMap';
import {
  GoalField,
  GoalInlineMeta,
  GoalPageShell,
  GoalProgressBar,
  GoalSection,
  GoalStateBadge,
} from './GoalEditorShared';
import {
  STAT_GROUP_OPTIONS,
  createBlankQuest,
  getExigencyLabel,
  normalizeActForSave,
  normalizeQuestForSave,
} from './goalEditorUtils';

type TimelyMode = 'none' | 'interval' | 'xpThreshold' | 'taskCount';

interface GoalQuestPageProps {
  act: Act;
  chainIdx: number;
  questIdx: number | null;
  readOnly: boolean;
  onBack: () => void;
  onSave: (act: Act) => void;
}

const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getRelevantText(quest: Quest): string {
  return typeof quest.relevant['reason'] === 'string'
    ? quest.relevant['reason'] as string
    : typeof quest.relevant['text'] === 'string'
      ? quest.relevant['text'] as string
      : '';
}

function getAttainableText(quest: Quest): string {
  return typeof quest.attainable['note'] === 'string'
    ? quest.attainable['note'] as string
    : typeof quest.attainable['text'] === 'string'
      ? quest.attainable['text'] as string
      : '';
}

function getResultText(quest: Quest): string {
  return typeof quest.result['description'] === 'string'
    ? quest.result['description'] as string
    : typeof quest.result['text'] === 'string'
      ? quest.result['text'] as string
      : '';
}

function buildRecurrenceRule(
  frequency: RecurrenceFrequency,
  days: Weekday[],
  interval: number,
  endsOn: string,
): RecurrenceRule {
  return {
    frequency,
    days,
    interval,
    endsOn: endsOn || null,
    customCondition: null,
  };
}

function getTaskCountThreshold(quest: Quest): number {
  return quest.timely.markers[0]?.threshold ?? 1;
}

function getTemplateStatGroup(template: TaskTemplate): StatGroupKey {
  const best = Object.entries(template.xpAward).reduce(
    (current, [key, value]) => value > current.value ? { key: key as StatGroupKey, value } : current,
    { key: 'health' as StatGroupKey, value: -1 },
  );
  return best.key;
}

export function GoalQuestPage({
  act,
  chainIdx,
  questIdx,
  readOnly,
  onBack,
  onSave,
}: GoalQuestPageProps) {
  const scheduleTemplates = useScheduleStore((state) => state.taskTemplates);
  const resources = useResourceStore((state) => state.resources);
  const existingQuest = questIdx !== null ? act.chains[chainIdx]?.quests[questIdx] : null;
  const baseQuest = existingQuest ?? createBlankQuest();

  const [icon, setIcon] = useState(baseQuest.icon);
  const [name, setName] = useState(baseQuest.name);
  const [description, setDescription] = useState(baseQuest.description);
  const [completionState] = useState(baseQuest.completionState);
  const [targetValue, setTargetValue] = useState(String(baseQuest.specific.targetValue));
  const [unit, setUnit] = useState(baseQuest.specific.unit ?? '');
  const [taskTemplateRefs, setTaskTemplateRefs] = useState<string[]>(baseQuest.measurable.taskTemplateRefs ?? []);
  const [resourceRef, setResourceRef] = useState(baseQuest.measurable.resourceRef ?? '');
  const [within91Days, setWithin91Days] = useState(baseQuest.attainable['within91Days'] === true);
  const [hasNeededResources, setHasNeededResources] = useState(baseQuest.attainable['hasNeededResources'] === true);
  const [attainableNote, setAttainableNote] = useState(getAttainableText(baseQuest));
  const [relevantStatGroup, setRelevantStatGroup] = useState<StatGroupKey>(
    (baseQuest.relevant['statGroup'] as StatGroupKey | undefined) ?? 'health',
  );
  const [relevantReason, setRelevantReason] = useState(getRelevantText(baseQuest));
  const [anticipatedEndDate, setAnticipatedEndDate] = useState(baseQuest.timely.projectedFinish ?? '');
  const [timelyMode, setTimelyMode] = useState<TimelyMode>(baseQuest.timely.conditionType);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(baseQuest.timely.interval?.frequency ?? 'weekly');
  const [days, setDays] = useState<Weekday[]>(baseQuest.timely.interval?.days ?? []);
  const [intervalCount, setIntervalCount] = useState(String(baseQuest.timely.interval?.interval ?? 1));
  const [timelyEndsOn, setTimelyEndsOn] = useState(baseQuest.timely.interval?.endsOn ?? '');
  const [xpThreshold, setXpThreshold] = useState(String(baseQuest.timely.xpThreshold ?? ''));
  const [taskCountThreshold, setTaskCountThreshold] = useState(String(getTaskCountThreshold(baseQuest)));
  const [exigency, setExigency] = useState<ExigencyOption>(baseQuest.exigency.onMissedFinish);
  const exigencyMeta = baseQuest.exigency as unknown as Record<string, unknown>;
  const [exigencyDate, setExigencyDate] = useState(
    typeof exigencyMeta['rescheduleDate'] === 'string'
      ? exigencyMeta['rescheduleDate'] as string
      : '',
  );
  const [exigencyInterval, setExigencyInterval] = useState(
    String(exigencyMeta['extendIntervalDays'] ?? ''),
  );
  const [resultDescription, setResultDescription] = useState(getResultText(baseQuest));
  const [xpAwardInput, setXpAwardInput] = useState(String((baseQuest.result['xpAward'] as number | undefined) ?? ''));

  const taskTemplates = useMemo(
    () => Object.entries(scheduleTemplates).map(([id, template]) => ({ id, template })),
    [scheduleTemplates],
  );
  const resourceEntries = useMemo(
    () => Object.values(resources).sort((a, b) => a.name.localeCompare(b.name)),
    [resources],
  );

  function toggleTemplate(templateId: string) {
    setTaskTemplateRefs((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId],
    );
  }

  function toggleDay(day: Weekday) {
    setDays((current) =>
      current.includes(day) ? current.filter((entry) => entry !== day) : [...current, day],
    );
  }

  function buildQuest(): Quest {
    const recurrence = timelyMode === 'interval'
      ? buildRecurrenceRule(
          frequency,
          days,
          Math.max(1, parseInt(intervalCount, 10) || 1),
          timelyEndsOn,
        )
      : null;

    const draftQuest: Quest = {
      ...baseQuest,
      icon,
      name: name.trim(),
      description: description.trim(),
      completionState,
      specific: {
        ...baseQuest.specific,
        targetValue: Math.max(1, parseInt(targetValue, 10) || 1),
        unit: unit.trim() || null,
      },
      measurable: {
        ...(taskTemplateRefs.length > 0 ? { taskTemplateRefs } : {}),
        ...(resourceRef ? { resourceRef } : {}),
      },
      attainable: {
        ...baseQuest.attainable,
        within91Days,
        hasNeededResources,
        note: attainableNote.trim(),
      },
      relevant: {
        ...baseQuest.relevant,
        statGroup: relevantStatGroup,
        reason: relevantReason.trim(),
      },
      timely: {
        ...baseQuest.timely,
        conditionType: timelyMode,
        interval: recurrence,
        xpThreshold: timelyMode === 'xpThreshold' ? (parseInt(xpThreshold, 10) || null) : null,
        projectedFinish: anticipatedEndDate || null,
      },
      exigency: {
        ...baseQuest.exigency,
        onMissedFinish: exigency,
        ...(exigency === 'reschedule' ? { rescheduleDate: exigencyDate || null } : {}),
        ...(exigency === 'extend' ? { extendIntervalDays: parseInt(exigencyInterval, 10) || null } : {}),
      },
      result: {
        ...baseQuest.result,
        description: resultDescription.trim(),
        xpAward: parseInt(xpAwardInput, 10) || 0,
      },
      questReward: baseQuest.questReward,
    };

    const normalizedQuestIdx = questIdx ?? act.chains[chainIdx]?.quests.length ?? 0;
    return normalizeQuestForSave(
      draftQuest,
      act.id,
      chainIdx,
      normalizedQuestIdx,
      timelyMode === 'taskCount' ? (parseInt(taskCountThreshold, 10) || 1) : null,
    );
  }

  function handleSave() {
    const updatedQuest = buildQuest();
    const updatedChains = [...act.chains];
    const targetChain = updatedChains[chainIdx];
    if (!targetChain) return;
    const updatedQuests = [...targetChain.quests];
    if (questIdx === null) {
      updatedQuests.push(updatedQuest);
    } else {
      updatedQuests[questIdx] = updatedQuest;
    }
    updatedChains[chainIdx] = { ...targetChain, quests: updatedQuests };
    onSave(normalizeActForSave({ ...act, chains: updatedChains }));
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
        onClick={handleSave}
        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Save
      </button>
    </>
  );

  return (
    <GoalPageShell
      title={name || 'Quest'}
      subtitle={readOnly ? 'Read-only quest' : 'SMARTER quest editor'}
      onBack={onBack}
      footer={footer}
    >
      <GoalSection title="Quest">
        <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-start">
          <IconPicker value={icon} onChange={setIcon} align="left" />
          <GoalField label="Name">
            <input
              type="text"
              value={name}
              disabled={readOnly}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </GoalField>
          <div className="flex items-start justify-end">
            <GoalStateBadge state={completionState} />
          </div>
        </div>

        <GoalField label="Description">
          <textarea
            value={description}
            disabled={readOnly}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span>{baseQuest.progressPercent}%</span>
          </div>
          <GoalProgressBar value={baseQuest.progressPercent} />
        </div>
      </GoalSection>

      <GoalSection title="Specific">
        <GoalField label="What is the measurable target?" hint="Target value and unit">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              min={1}
              value={targetValue}
              disabled={readOnly}
              onChange={(e) => setTargetValue(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="text"
              value={unit}
              disabled={readOnly}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="sessions, reps, miles..."
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </div>
        </GoalField>
      </GoalSection>

      <GoalSection title="Measurable">
        <GoalField label="Task templates" hint="Which tasks or resources track progress?">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {taskTemplateRefs.map((ref) => {
                const template = scheduleTemplates[ref];
                return (
                  <button
                    key={ref}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleTemplate(ref)}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    {template?.name ?? ref} ×
                  </button>
                );
              })}
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-gray-200 p-2 dark:border-gray-700">
              {taskTemplates.map(({ id, template }) => {
                const selected = taskTemplateRefs.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleTemplate(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${
                      selected ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                  >
                    <span className="text-lg">{resolveIcon(getTemplateStatGroup(template))}</span>
                    <span className="text-lg">{resolveIcon(template.taskType.toLowerCase())}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{template.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <GoalInlineMeta icon={template.taskType.toLowerCase()} text={template.taskType} />
                        <GoalInlineMeta icon={getTemplateStatGroup(template)} text={getTemplateStatGroup(template)} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </GoalField>

        <GoalField label="Resource selector">
          <select
            value={resourceRef}
            disabled={readOnly}
            onChange={(e) => setResourceRef(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="">No resource</option>
            {resourceEntries.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type})
              </option>
            ))}
          </select>
        </GoalField>
      </GoalSection>

      <GoalSection title="Attainable">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={within91Days} disabled={readOnly} onChange={(e) => setWithin91Days(e.target.checked)} className="accent-emerald-600" />
            <span>Can be accomplished in 91 days</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={hasNeededResources} disabled={readOnly} onChange={(e) => setHasNeededResources(e.target.checked)} className="accent-emerald-600" />
            <span>Have the inventory/resources needed</span>
          </label>
        </div>
        <GoalField label="Note">
          <textarea
            value={attainableNote}
            disabled={readOnly}
            onChange={(e) => setAttainableNote(e.target.value)}
            rows={3}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>
      </GoalSection>

      <GoalSection title="Relevant">
        <GoalField label="Stat group">
          <select
            value={relevantStatGroup}
            disabled={readOnly}
            onChange={(e) => setRelevantStatGroup(e.target.value as StatGroupKey)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            {STAT_GROUP_OPTIONS.map((stat) => (
              <option key={stat} value={stat}>{stat}</option>
            ))}
          </select>
        </GoalField>
        <GoalField label="Why does this matter to you?">
          <textarea
            value={relevantReason}
            disabled={readOnly}
            onChange={(e) => setRelevantReason(e.target.value)}
            rows={3}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>
      </GoalSection>

      <GoalSection title="Timely">
        <GoalField label="Anticipated end date">
          <input
            type="date"
            value={anticipatedEndDate}
            disabled={readOnly}
            onChange={(e) => setAnticipatedEndDate(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>

        <GoalField label="Check-in type">
          <select
            value={timelyMode}
            disabled={readOnly}
            onChange={(e) => setTimelyMode(e.target.value as TimelyMode)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="none">None</option>
            <option value="interval">By recurrence</option>
            <option value="xpThreshold">By XP threshold</option>
            <option value="taskCount">By task count</option>
          </select>
        </GoalField>

        {timelyMode === 'interval' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <GoalField label="Frequency">
              <select
                value={frequency}
                disabled={readOnly}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="custom">custom</option>
              </select>
            </GoalField>
            <GoalField label="Interval">
              <input
                type="number"
                min={1}
                value={intervalCount}
                disabled={readOnly}
                onChange={(e) => setIntervalCount(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </GoalField>
            <GoalField label="Ends on">
              <input
                type="date"
                value={timelyEndsOn}
                disabled={readOnly}
                onChange={(e) => setTimelyEndsOn(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </GoalField>
            <GoalField label="Days">
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleDay(day)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      days.includes(day)
                        ? 'bg-emerald-600 text-white'
                        : 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </GoalField>
          </div>
        ) : null}

        {timelyMode === 'xpThreshold' ? (
          <GoalField label="XP value">
            <input
              type="number"
              min={1}
              value={xpThreshold}
              disabled={readOnly}
              onChange={(e) => setXpThreshold(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </GoalField>
        ) : null}

        {timelyMode === 'taskCount' ? (
          <GoalField label="Count value">
            <input
              type="number"
              min={1}
              value={taskCountThreshold}
              disabled={readOnly}
              onChange={(e) => setTaskCountThreshold(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </GoalField>
        ) : null}
      </GoalSection>

      <GoalSection title="Exigency">
        <GoalField label="If end date passes without completing:">
          <select
            value={exigency}
            disabled={readOnly}
            onChange={(e) => setExigency(e.target.value as ExigencyOption)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="reschedule">{getExigencyLabel('reschedule')}</option>
            <option value="extend">{getExigencyLabel('extend')}</option>
            <option value="sleep">{getExigencyLabel('sleep')}</option>
            <option value="restart">{getExigencyLabel('restart')}</option>
          </select>
        </GoalField>

        {exigency === 'reschedule' ? (
          <GoalField label="New end date">
            <input
              type="date"
              value={exigencyDate}
              disabled={readOnly}
              onChange={(e) => setExigencyDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </GoalField>
        ) : null}

        {exigency === 'extend' ? (
          <GoalField label="Extend interval (days)">
            <input
              type="number"
              min={1}
              value={exigencyInterval}
              disabled={readOnly}
              onChange={(e) => setExigencyInterval(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </GoalField>
        ) : null}
      </GoalSection>

      <GoalSection title="Result">
        <GoalField label="What does completion unlock or reward?">
          <textarea
            value={resultDescription}
            disabled={readOnly}
            onChange={(e) => setResultDescription(e.target.value)}
            rows={3}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>
        <GoalField label="XP award">
          <input
            type="number"
            min={0}
            value={xpAwardInput}
            disabled={readOnly}
            onChange={(e) => setXpAwardInput(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </GoalField>
      </GoalSection>
    </GoalPageShell>
  );
}
