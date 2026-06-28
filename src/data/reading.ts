// 読解(JLPT 本番形式)データの型付きローダ。正本= ../../読解.xlsx を conv_reading.py で reading.json 化。
// 正解は answer(テキスト)で保持し、出題時に choices をシャッフルして本番同様 正解位置をランダムにする。
import raw from './reading.json';

export type Level = 'N5' | 'N4' | 'N3';
export type CatCode = 'T' | 'C' | 'L' | 'J';

export interface ReadingItem {
  id: string;
  question: string;
  choices: string[];
  answer: string; // 正解の選択肢テキスト
  difficulty: string;
  aim: string; // 出題ねらい(解説に使用)
  figure?: string;
  note?: string;
}
export interface ReadingScript {
  scriptId: string;
  passage: string;
  charCount: number | null;
  items: ReadingItem[];
}

interface ReadingDB {
  levels: Level[];
  categoryOrder: CatCode[];
  categoryLabels: Record<CatCode, string>;
  data: Record<Level, Record<CatCode, ReadingScript[]>>;
}

const db = raw as unknown as ReadingDB;

export const LEVELS = db.levels;
export const CATEGORY_ORDER = db.categoryOrder;
export const CATEGORY_LABELS = db.categoryLabels;

/** 指定レベルで問題が存在する学習区分(順序付き)を返す。 */
export function categoriesForLevel(level: Level): CatCode[] {
  return CATEGORY_ORDER.filter((c) => (db.data[level]?.[c]?.length ?? 0) > 0);
}

export function scriptsFor(level: Level, cat: CatCode): ReadingScript[] {
  return db.data[level]?.[cat] ?? [];
}

export function questionCount(level: Level, cat: CatCode): number {
  return scriptsFor(level, cat).reduce((n, s) => n + s.items.length, 0);
}

/** Fisher-Yates シャッフル(新配列を返す)。 */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
