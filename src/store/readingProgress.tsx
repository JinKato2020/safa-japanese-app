// 読解の学習進捗(回答済み問題ID)を永続保持する共有ストア。
// 長文タブで markAnswered(id) を呼び、ホームのレベル別カバー率リングが同じ state からライブ更新される。
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVELS, totalForLevel, levelOf, type Level } from '../data/reading';

const STORAGE_KEY = 'safa-ja:reading-progress';

export interface LevelCoverage {
  level: Level;
  done: number;
  total: number;
  ratio: number; // 0..1
}

interface ReadingProgressCtx {
  answered: Set<string>;
  markAnswered: (id: string) => void;
  coverage: LevelCoverage[];
  reset: () => void;
}

const Ctx = createContext<ReadingProgressCtx>({
  answered: new Set(),
  markAnswered: () => {},
  coverage: [],
  reset: () => {},
});

export function ReadingProgressProvider({ children }: { children: ReactNode }) {
  const [answered, setAnswered] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (!alive || !v) return;
        try {
          const arr = JSON.parse(v) as string[];
          if (Array.isArray(arr)) setAnswered(new Set(arr));
        } catch { /* noop */ }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const markAnswered = useCallback((id: string) => {
    setAnswered((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswered(new Set());
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const coverage = useMemo<LevelCoverage[]>(() => {
    const perLevel: Record<string, number> = {};
    for (const id of answered) {
      const lv = levelOf(id);
      if (lv) perLevel[lv] = (perLevel[lv] ?? 0) + 1;
    }
    return LEVELS.map((level) => {
      const total = totalForLevel(level);
      const done = Math.min(perLevel[level] ?? 0, total);
      return { level, done, total, ratio: total > 0 ? done / total : 0 };
    });
  }, [answered]);

  return (
    <Ctx.Provider value={{ answered, markAnswered, coverage, reset }}>{children}</Ctx.Provider>
  );
}

export const useReadingProgress = (): ReadingProgressCtx => useContext(Ctx);
