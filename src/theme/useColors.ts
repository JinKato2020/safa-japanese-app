// 現在のテーマパレットを返すフック。settings.theme(light/dark/auto)＋端末の配色から解決。
import { useColorScheme } from 'react-native';
import { useSettings } from '../store/settings';
import { darkColors, lightColors, type ThemeColors } from './theme';

export function useColors(): ThemeColors {
  const { settings } = useSettings();
  const sys = useColorScheme(); // 'light' | 'dark' | null
  const mode = settings.theme === 'auto' ? (sys ?? 'light') : settings.theme;
  return mode === 'dark' ? darkColors : lightColors;
}

/** scheme('light'|'dark') を解決(DesignThemeProvider へ渡す用)。 */
export function useScheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const sys = useColorScheme();
  return settings.theme === 'auto' ? (sys ?? 'light') : settings.theme;
}
