// 現在のテーマパレットを返すフック。settings.theme で 明暗＋背景(水彩グラデーション)を一括解決。
import { useColorScheme } from 'react-native';
import { useSettings } from '../store/settings';
import { darkColors, lightColors, isGradientTheme, type ThemeColors } from './theme';

/** settings.theme から実際の配色モード(light/dark)を解決。 */
export function useScheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const sys = useColorScheme();
  const t = settings.theme;
  if (t === 'dark') return 'dark';
  if (t === 'auto') return sys ?? 'light';
  return 'light'; // light / sakura / sky / watercolor は明るい配色
}

export function useColors(): ThemeColors {
  const { settings } = useSettings();
  const mode = useScheme();
  const base = mode === 'dark' ? darkColors : lightColors;
  // 水彩グラデーション・テーマは画面の地色を透過し、ルートの AppBackground(動的背景)を見せる。
  // カード(surface=白)はそのまま。入れ子の地(bgSoft)は半透明の白で読みやすさを確保。
  if (isGradientTheme(settings.theme)) {
    return { ...base, bg: 'transparent', bgSoft: 'rgba(255,255,255,0.55)' };
  }
  return base;
}

/** 生のテーマキー(AppBackground 用)。 */
export function useAppTheme(): string {
  return useSettings().settings.theme;
}
