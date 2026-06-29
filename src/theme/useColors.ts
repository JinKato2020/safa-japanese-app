// 現在のテーマパレットを返すフック。settings.theme(light/dark/auto)＋端末の配色から解決。
import { useColorScheme } from 'react-native';
import { useSettings } from '../store/settings';
import { darkColors, lightColors, BACKGROUNDS, type ThemeColors, type BackgroundKey } from './theme';

export function useColors(): ThemeColors {
  const { settings } = useSettings();
  const sys = useColorScheme(); // 'light' | 'dark' | null
  const mode = settings.theme === 'auto' ? (sys ?? 'light') : settings.theme;
  const base = mode === 'dark' ? darkColors : lightColors;
  // 背景カラーのプリセットを反映(bg/bgSoftのみ上書き。カード=surfaceは白のまま)
  const bgKey = (settings.background ?? 'default') as BackgroundKey;
  const bset = (BACKGROUNDS[bgKey] ?? BACKGROUNDS.default)[mode];
  return { ...base, bg: bset.bg, bgSoft: bset.bgSoft };
}

/** scheme('light'|'dark') を解決(DesignThemeProvider へ渡す用)。 */
export function useScheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const sys = useColorScheme();
  return settings.theme === 'auto' ? (sys ?? 'light') : settings.theme;
}
