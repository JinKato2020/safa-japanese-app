// safa 日本語アプリ デザインシステム。色はライト/ダークの2パレットを実行時に切替(useColors)。
// 余白/角丸/タイポはテーマ非依存(静的)。配色は「まいにちJLPT」と同一(姉妹アプリでUI統一)。
// ※色トークンの正本は shared/design(JLPT主導)。本ファイルは画面互換のためのローカル版。

export interface ThemeColors {
  bg: string;
  bgSoft: string;
  surface: string;
  ink: string;
  ink2: string;
  mute: string;
  faint: string;
  trace: string;
  line: string;
  // ブランド(safa青)
  blue: string;
  blueDark: string;  // blueLight 上の文字色
  blueLight: string; // 選択チップ背景
  // 状態色
  green: string;
  amber: string;
  orange: string;
  red: string;
  purple: string;
  // 意味的背景(ダークでも破綻しないようトークン化)
  okBg: string;
  okBorder: string;
  ngBg: string;
  fireBg: string;
  fireBorder: string;
}

export const lightColors: ThemeColors = {
  bg: '#f8fafc',
  bgSoft: '#f1f5f9',
  surface: '#ffffff',
  ink: '#0f172a',
  ink2: '#1e293b',
  mute: '#64748b',
  faint: '#94a3b8',
  trace: '#cbd5e1',
  line: '#e2e8f0',
  blue: '#2563eb',
  blueDark: '#1e40af',
  blueLight: '#dbeafe',
  green: '#16a34a',
  amber: '#f59e0b',
  orange: '#f97316',
  red: '#ef4444',
  purple: '#7c3aed',
  okBg: '#f0fdf4',
  okBorder: '#bbf7d0',
  ngBg: '#fef2f2',
  fireBg: '#fff7ed',
  fireBorder: '#fed7aa',
};

export const darkColors: ThemeColors = {
  bg: '#0b1220',
  bgSoft: '#0f1a2e',
  surface: '#16233b',
  ink: '#f8fafc',
  ink2: '#e2e8f0',
  mute: '#94a3b8',
  faint: '#64748b',
  trace: '#475569',
  line: '#2b3a52',
  blue: '#3b82f6',
  blueDark: '#bfdbfe',
  blueLight: '#1e3a8a',
  green: '#22c55e',
  amber: '#fbbf24',
  orange: '#fb923c',
  red: '#f87171',
  purple: '#a78bfa',
  okBg: '#0c2a18',
  okBorder: '#166534',
  ngBg: '#3b0d0d',
  fireBg: '#3a1d0a',
  fireBorder: '#7c2d12',
};

/** 既定パレット(ライト)。実行時の切替は useColors を使う。 */
export const colors = lightColors;

/** 「桜水彩」テーマ。水彩のにじみ(layered washes)＋金粉＋舞う桜の和モダン高級背景(単一デザイン)。 */
// 水彩テーマ(流れる水彩のみ・花びらや金は無し)。色違いを複数用意。
export type GradientTheme = 'sakura' | 'sora' | 'midori' | 'fuji' | 'akane';
export const GRADIENT_THEMES: GradientTheme[] = ['sakura', 'sora', 'midori', 'fuji', 'akane'];
export const isGradientTheme = (t: string): t is GradientTheme => (GRADIENT_THEMES as string[]).includes(t);

/** 各テーマのパレット(RGB 0..1)。base=地色＋a1/a2/a3=にじむ差し色。やわらかく明るい(本文の可読性を確保)。 */
export interface Palette { base: number[]; a1: number[]; a2: number[]; a3: number[] }
export const PALETTES: Record<GradientTheme, Palette> = {
  sakura: { base: [0.992, 0.965, 0.973], a1: [0.964, 0.760, 0.840], a2: [0.900, 0.740, 0.900], a3: [0.952, 0.660, 0.780] }, // 桜(ピンク)
  sora:   { base: [0.950, 0.970, 1.000], a1: [0.720, 0.830, 0.950], a2: [0.760, 0.785, 0.945], a3: [0.660, 0.805, 0.930] }, // 空(青)
  midori: { base: [0.960, 0.980, 0.952], a1: [0.740, 0.880, 0.760], a2: [0.815, 0.900, 0.720], a3: [0.660, 0.855, 0.785] }, // 新緑(緑)
  fuji:   { base: [0.975, 0.965, 0.992], a1: [0.840, 0.760, 0.920], a2: [0.900, 0.770, 0.880], a3: [0.760, 0.720, 0.915] }, // 藤(紫)
  akane:  { base: [0.992, 0.965, 0.950], a1: [0.962, 0.812, 0.660], a2: [0.952, 0.720, 0.650], a3: [0.940, 0.785, 0.600] }, // 茜(橙)
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 6, md: 10, lg: 16, xl: 20, pill: 999 };
export const type = { hero: 54, h1: 24, h2: 18, body: 14, small: 12, tiny: 10 };
