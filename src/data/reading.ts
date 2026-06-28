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
  aim: string; // 出題ねらい(日本語・原本)
  aimEn?: string; // 出題ねらい(英訳・解説表示用)
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

/** 学習区分の英語ラベル(UI英語化用)。 */
export const CATEGORY_LABELS_EN: Record<CatCode, string> = {
  T: 'Comprehension · Short',
  C: 'Comprehension · Medium',
  L: 'Comprehension · Long',
  J: 'Information Retrieval',
};

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

/** そのレベルの全問数(全学習区分の合計)。カバー率の分母に使う。 */
export function totalForLevel(level: Level): number {
  return categoriesForLevel(level).reduce((n, c) => n + questionCount(level, c), 0);
}

/** 問題ID(例 N5-D-T-001)からレベルを取り出す。未知なら null。 */
export function levelOf(id: string): Level | null {
  const lv = id.split('-')[0] as Level;
  return LEVELS.includes(lv) ? lv : null;
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
