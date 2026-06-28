// アプリUIの文言(i18n)。現在は英語のみ(ユーザー方針「言語選択=現在は英語だけ」)。
// 言語追加時は TABLE に <code>:{...} を足し、settings.language を切替えるだけで全画面が反映される。
import { useSettings } from './store/settings';

export interface LangOption { code: string; label: string }
export const LANGUAGES: LangOption[] = [
  { code: 'en', label: 'English' },
  // 追加予定: { code: 'ja', label: '日本語' } など
];

const en = {
  // タブ
  tabHome: 'Home',
  tabReading: 'Reading',
  tabDict: 'Dictionary',
  tabSettings: 'Settings',

  // 共通
  appName: 'Listen & Speak Japanese',

  // ホーム
  homeKicker: 'HOME',
  heroTitle: 'Keep it up, day by day.',
  heroBody: 'Your study days are logged automatically. Build your streak and collect badges.',
  coverageTitle: 'Coverage by level (Reading)',
  recordTitle: 'Study record',
  statStreak: 'Streak (days)',
  statLongest: 'Longest (days)',
  statTotal: 'Total (days)',
  thisWeek: 'This week',
  last5weeks: 'Last 5 weeks',
  badgesTitle: 'Streak badges',
  badgeEarned: 'Earned',
  badgeHint: (n: number) => `Reach a ${n}-day streak`,
  badge3: '3-day streak',
  badge7: '1 week',
  badge14: '2 weeks',
  badge30: '1 month',
  badge60: '2 months',
  badge100: '100 days',
  qShort: (n: number) => `${n} Q`,

  // 読解
  readingKicker: 'READING',
  readingTitle: 'Reading',
  readingSub: 'JLPT-style reading questions. Pick a level and start.',
  questionsCount: (n: number) => `${n} Q`,
  oneQuestion: '1 question',
  nQuestions: (n: number) => `${n} questions`,
  chars: (n: number) => `Passage · ${n} chars`,
  passageChars: (n: number) => `${n} chars`,
  list: '‹ List',
  qNo: (n: number) => `Q${n}　`,
  focus: 'Focus',
  prev: '‹ Prev',
  next: 'Next ›',

  // 辞書
  dictKicker: 'DICT',
  dictWord: 'Words',
  dictKanji: 'Kanji',
  all: 'All',
  searchPlaceholder: 'Search word, reading, or meaning',
  resultsCount: (n: number) => `${n} results`,
  noResults: 'No matches',
  dictError: 'Could not load the dictionary (you may be offline).\nPlease reopen with a connection.',
  dictLoading: 'Loading dictionary… (first time only)',
  onLabel: 'On',
  kunLabel: 'Kun',
  gradeLabel: (n: number | string) => `Grade ${n}`,
  strokesLabel: (n: number | string) => `${n} strokes`,

  // 設定
  settingsKicker: 'SETTINGS',
  settingsTitle: 'Settings',
  theme: 'Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeAuto: 'Auto',
  language: 'Language',
  legal: 'About & Legal',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  rate: 'Rate this app',
  privacyUrl: 'https://safa-lang.com/ja/en/privacy/',
  termsUrl: 'https://safa-lang.com/ja/en/terms/',
  openError: 'Could not open the link.',
  dictSourceLabel: 'Dictionary data source',
  resetIdle: 'Reset data',
  resetArm: 'Tap again to reset',
};

export type Strings = typeof en;

const TABLE: Record<string, Strings> = { en };

export function strings(lang: string): Strings {
  return TABLE[lang] ?? en;
}

/** 現在の言語設定に対応する文言を返すフック。 */
export function useT(): Strings {
  const { settings } = useSettings();
  return strings(settings.language);
}
