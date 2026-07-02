// 最小の設定ストア(AsyncStorage永続)。テーマモードのみを保持。
// 学習機能の追加に合わせて項目を拡張していく(目標級・母語・リマインダ等)。
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// テーマ＝外観(明暗)と背景を1つに統一。
//  auto/light/dark = 単色。sakura = 「桜水彩」(水彩のにじみ＋金粉＋舞う桜の高級背景)。
export type ThemeMode = 'auto' | 'light' | 'dark' | 'sakura' | 'sora' | 'midori' | 'fuji' | 'akane';

export interface Settings {
  theme: ThemeMode;
  language: string; // UI言語(en/ja)
  font: string;     // 表示フォント(system/maru/mincho/kyokasho)
  listStyle: string; // 短文/長文のボタン意匠(B=和モダン明朝罫線 / C=やわらかフロスト教科書体)
}

const DEFAULT: Settings = { theme: 'sakura', language: 'en', font: 'maru', listStyle: 'B' }; // 既定=英語＋丸ゴシック＋和モダン
const STORAGE_KEY = 'safa-ja:settings';

interface SettingsCtx {
  settings: Settings;
  hydrated: boolean;
  setSettings: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const Ctx = createContext<SettingsCtx>({
  settings: DEFAULT,
  hydrated: false,
  setSettings: () => {},
  reset: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setState] = useState<Settings>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (!alive) return;
        if (v) {
          try { setState({ ...DEFAULT, ...JSON.parse(v) }); } catch { /* noop */ }
        }
        setHydrated(true);
      })
      .catch(() => { if (alive) setHydrated(true); });
    return () => { alive = false; };
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT);
    AsyncStorage.clear().catch(() => {});
  }, []);

  return <Ctx.Provider value={{ settings, hydrated, setSettings, reset }}>{children}</Ctx.Provider>;
}

export const useSettings = (): SettingsCtx => useContext(Ctx);
