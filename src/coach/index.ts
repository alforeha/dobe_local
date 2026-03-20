// ─────────────────────────────────────────
// COACH — MODULE INDEX
// Typed imports for the 3 APP BUNDLE static JSON libraries.
// Cast to their TypeScript interfaces — data ships with the binary.
// ─────────────────────────────────────────

import type { CommentLibrary, AchievementLibrary, CharacterLibrary } from '../types/coach';

import commentLibraryRaw from './CommentLibrary.json';
import achievementLibraryRaw from './AchievementLibrary.json';
import characterLibraryRaw from './CharacterLibrary.json';

export const commentLibrary = commentLibraryRaw as CommentLibrary;
export const achievementLibrary = achievementLibraryRaw as AchievementLibrary;
export const characterLibrary = characterLibraryRaw as CharacterLibrary;
