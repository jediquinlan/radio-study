import technicianData from '../assets/images/data/technician-2022-2026.json';
import generalData from '../assets/images/data/general-2023-2027.json';
import extraData from '../assets/images/data/extra-2024-2028.json';

import technicianSyllabus from '../assets/images/data/technician-2022-2026-syllabus.json';
import generalSyllabus from '../assets/images/data/general-2023-2027-syllabus.json';
import extraSyllabus from '../assets/images/data/extra-2024-2028-syllabus.json';

import technicianHints from '../assets/images/data/technician-2022-2026-hints.json';
import generalHints from '../assets/images/data/general-2023-2027-hints.json';
import extraHints from '../assets/images/data/extra-2024-2028-hints.json';

import bookReferencesData from '../assets/images/data/book-references.json';

export type PoolId = 'technician' | 'general' | 'extra';

export interface Question {
  id: string;
  pool: PoolId;
  subelement: string; // e.g. 'T1', 'T2'
  group: string;      // e.g. 'T1A', 'T1B'
  question: string;
  answers: string[];
  correct: number;    // 0-based index into answers
  refs: string;
}

export interface SubelementMeta {
  title: string;
  exam_questions: number;
  num_groups: number;
  total_questions: number;
  groups: Record<string, string>; // group letter → description
}

export const POOL_LABELS: Record<PoolId, string> = {
  technician: 'Technician',
  general: 'General',
  extra: 'Extra',
};

const RAW_DATA: Record<PoolId, any[]> = {
  technician: technicianData as any[],
  general: generalData as any[],
  extra: extraData as any[],
};

const SYLLABUS: Record<PoolId, { subelements: Record<string, SubelementMeta> }> = {
  technician: technicianSyllabus as any,
  general: generalSyllabus as any,
  extra: extraSyllabus as any,
};

export interface HintData {
  hint: string;
  explanation: string;
}

const HINTS: Record<PoolId, Record<string, HintData>> = {
  technician: technicianHints as any,
  general: generalHints as any,
  extra: extraHints as any,
};

/** Returns hint and explanation for a question, or undefined if not found. */
export function getHintData(pool: PoolId, questionId: string): HintData | undefined {
  return HINTS[pool]?.[questionId];
}

export interface BookReference {
  question: string;
  chapter: number;
  section: number;
  page: number | null;
  book: string;
}

const BOOK_REFS = new Map<string, BookReference>(
  (bookReferencesData as BookReference[]).map((r) => [r.question, r])
);

/** Returns book/chapter/section reference for a question, or undefined if not mapped. */
export function getBookReference(questionId: string): BookReference | undefined {
  return BOOK_REFS.get(questionId);
}

function parseQuestion(raw: any, pool: PoolId): Question {
  const id: string = raw.id;
  return {
    id,
    pool,
    subelement: id.slice(0, 2), // 'T1'
    group: id.slice(0, 3),      // 'T1A'
    question: raw.question,
    answers: raw.answers,
    correct: raw.correct,
    refs: raw.refs ?? '',
  };
}

const cache: Partial<Record<PoolId, Question[]>> = {};

export function getQuestions(pool: PoolId): Question[] {
  if (!cache[pool]) {
    cache[pool] = RAW_DATA[pool].map((q) => parseQuestion(q, pool));
  }
  return cache[pool]!;
}

/** Returns subelement metadata from the official NCVEC syllabus. */
export function getSubelementMeta(pool: PoolId, subelement: string): SubelementMeta | undefined {
  return SYLLABUS[pool].subelements[subelement];
}

/** Returns all subelement IDs in order from the syllabus. */
export function getSubelements(pool: PoolId): string[] {
  return Object.keys(SYLLABUS[pool].subelements);
}

/** Returns all group IDs (e.g. 'T1A') in order from the syllabus. */
export function getGroups(pool: PoolId): string[] {
  return Object.entries(SYLLABUS[pool].subelements).flatMap(([sub, meta]) =>
    Object.keys(meta.groups).map((letter) => sub + letter)
  );
}

/** Returns the description for a specific group from the syllabus. */
export function getGroupDescription(pool: PoolId, group: string): string {
  const sub = group.slice(0, 2);
  const letter = group.slice(2);
  return SYLLABUS[pool].subelements[sub]?.groups[letter] ?? '';
}

export function getQuestionsBySubelement(pool: PoolId, subelement: string): Question[] {
  return getQuestions(pool).filter((q) => q.subelement === subelement);
}

export function getQuestionsByGroup(pool: PoolId, group: string): Question[] {
  return getQuestions(pool).filter((q) => q.group === group);
}

export function getMissedQuestions(
  pool: PoolId,
  missedIds: Set<string>
): Question[] {
  return getQuestions(pool).filter((q) => missedIds.has(q.id));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Builds a valid practice exam: one random question per group, shuffled. */
export function buildPracticeExam(pool: PoolId): Question[] {
  const groups = getGroups(pool);
  const picked = groups.map((group) => {
    const qs = getQuestionsByGroup(pool, group);
    return qs[Math.floor(Math.random() * qs.length)];
  });
  return shuffle(picked);
}

export function getRandomQuestions(pool: PoolId, count?: number): Question[] {
  const shuffled = shuffle(getQuestions(pool));
  return count ? shuffled.slice(0, count) : shuffled;
}

/** Returns shuffled answer indices for display (scrambles answer order). */
export function shuffleAnswerOrder(question: Question): number[] {
  return shuffle([0, 1, 2, 3]);
}

/**
 * Weighted random question picker based on user performance.
 * Questions answered incorrectly get higher weight; unseen questions
 * get moderate weight; mastered questions get low weight.
 */
export interface PerformanceRecord {
  question_id: string;
  total: number;
  correct: number;
}

export function weightedPickQuestion(
  questions: Question[],
  performance: Map<string, PerformanceRecord>,
  recentIds: Set<string>,
): Question {
  const weights = questions.map((q) => {
    // Avoid showing same question back-to-back
    if (recentIds.has(q.id)) return 0.01;

    const rec = performance.get(q.id);
    if (!rec || rec.total === 0) return 3; // unseen — moderate priority
    const accuracy = rec.correct / rec.total;
    if (accuracy < 0.5) return 5;          // struggling — highest priority
    if (accuracy < 0.8) return 2;          // learning — medium
    return 0.5;                            // mastered — low
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < questions.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return questions[i];
  }
  return questions[questions.length - 1];
}
