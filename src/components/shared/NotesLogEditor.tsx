// ─────────────────────────────────────────
// NotesLogEditor — D95
// Timestamped note log for resource forms.
// Tabs: 📓 Notes | 📎 Attachments (stub).
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ResourceNote } from '../../types/resource';

interface NotesLogEditorProps {
  notes: ResourceNote[];
  onChange: (notes: ResourceNote[]) => void;
}

function formatNoteTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  );
}

export function NotesLogEditor({ notes, onChange }: NotesLogEditorProps) {
  const [newText, setNewText] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'attachments'>('notes');

  function addNote() {
    const text = newText.trim();
    if (!text) return;
    const note: ResourceNote = {
      id: uuidv4(),
      text,
      createdAt: new Date().toISOString(),
    };
    onChange([...notes, note]);
    setNewText('');
  }

  function removeNote(id: string) {
    onChange(notes.filter((n) => n.id !== id));
  }

  const sorted = [...notes].reverse();

  return (
    <div className="flex flex-col gap-2">
      {/* Tab bar */}
      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-1">
        {(['notes', 'attachments'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-medium pb-0.5 border-b-2 transition-colors ${
              activeTab === tab
                ? 'text-blue-500 border-blue-500'
                : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'notes' ? '📓 Notes' : '📎 Attachments'}
          </button>
        ))}
      </div>

      {activeTab === 'notes' && (
        <>
          {sorted.length === 0 && (
            <p className="text-xs text-gray-400 italic">No notes yet.</p>
          )}
          {sorted.map((note) => (
            <div
              key={note.id}
              className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/60 rounded-md px-2.5 py-2"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatNoteTime(note.createdAt)}
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line break-words">
                  {note.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeNote(note.id)}
                aria-label="Remove note"
                className="text-gray-400 hover:text-red-400 text-xs font-bold shrink-0 mt-0.5 leading-none"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add note row */}
          <div className="flex gap-2 items-start">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNote();
                }
              }}
              placeholder="Add a note…"
              maxLength={500}
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addNote}
              disabled={!newText.trim()}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-500 text-white disabled:opacity-40 hover:bg-blue-600 transition-colors shrink-0"
            >
              Add
            </button>
          </div>
        </>
      )}

      {activeTab === 'attachments' && (
        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-4 text-center">
          <p className="text-xs text-gray-400 italic">Attachments coming soon.</p>
        </div>
      )}
    </div>
  );
}
