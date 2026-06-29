// アプリUIの文言(i18n)。現在は英語のみ(ユーザー方針「言語選択=現在は英語だけ」)。
// 言語追加時は TABLE に <code>:{...} を足し、settings.language を切替えるだけで全画面が反映される。
import { useSettings } from './store/settings';

export interface LangOption { code: string; label: string }
export const LANGUAGES: LangOption[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }, // 開発用(公開前に既定をenへ戻す)
];

const en = {
  // タブ
  tabHome: 'Home',
  tabShort: 'Short',
  tabLong: 'Long',
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

  // 短文・長文(精聴・精読)
  shortKicker: 'SHORT',
  shortTitle: 'Short',
  shortSub: 'Short, practical Japanese for daily life — listen & read.',
  longKicker: 'LONG',
  longTitle: 'Long',
  longSub: 'Longer listening: stories, radio & documentaries to enjoy.',
  comingSoon: 'Coming soon',
  audioComingSoon: 'Audio coming soon',
  translationLabel: 'Translation',
  keyPhrasesLabel: 'Key phrases',
  pointLabel: 'Point',
  usefulForLabel: 'Useful for',

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
  themeAuto: 'Auto',
  themeDefault: 'Default',
  themeSakura: 'Sakura Watercolor',
  themeDark: 'Dark',
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

const ja: Strings = {
  tabHome: 'ホーム', tabShort: '短文', tabLong: '長文', tabReading: '読解', tabDict: '辞書', tabSettings: '設定',
  appName: '聞いて話せる日本語',
  homeKicker: 'ホーム',
  heroTitle: '毎日、こつこつ続けよう。',
  heroBody: '学習した日は自動で記録されます。連続記録をのばして、バッジを集めましょう。',
  coverageTitle: 'レベル別カバー率（読解）',
  recordTitle: '学習の記録',
  statStreak: '連続(日)', statLongest: '最長(日)', statTotal: '累計(日)',
  thisWeek: '今週', last5weeks: 'この5週間',
  badgesTitle: '連続学習バッジ', badgeEarned: '獲得済み',
  badgeHint: (n: number) => `${n}日連続で獲得`,
  badge3: '3日連続', badge7: '1週間', badge14: '2週間', badge30: '1ヶ月', badge60: '2ヶ月', badge100: '100日',
  qShort: (n: number) => `${n}問`,
  shortKicker: '短文', shortTitle: '短文', shortSub: '暮らしで使う短い日本語を、聞いて・読んで身につける。',
  longKicker: '長文', longTitle: '長文', longSub: '物語・ラジオ・ドキュメンタリーで、長めの日本語を楽しく。',
  comingSoon: '準備中', audioComingSoon: '音声は準備中',
  translationLabel: '翻訳', keyPhrasesLabel: 'キー表現', pointLabel: 'ポイント', usefulForLabel: '役立つ場面',
  readingKicker: '読解', readingTitle: '読解', readingSub: 'JLPT形式の読解問題。レベルを選んで始めよう。',
  questionsCount: (n: number) => `${n}問`,
  oneQuestion: '1問', nQuestions: (n: number) => `${n}問`,
  chars: (n: number) => `本文 ${n}字`, passageChars: (n: number) => `${n}字`,
  list: '‹ 一覧', qNo: (n: number) => `問${n}　`, focus: 'ねらい', prev: '‹ 前へ', next: '次へ ›',
  dictKicker: '辞書', dictWord: '単語', dictKanji: '漢字', all: 'すべて',
  searchPlaceholder: '語・読み・意味で検索',
  resultsCount: (n: number) => `${n}件`, noResults: '該当なし',
  dictError: '辞書を取得できませんでした（オフラインの可能性）。\n通信できる状態でもう一度開いてください。',
  dictLoading: '辞書を読み込み中…（初回のみ通信）',
  onLabel: '音', kunLabel: '訓',
  gradeLabel: (n: number | string) => `小${n}`, strokesLabel: (n: number | string) => `${n}画`,
  settingsKicker: '設定', settingsTitle: '設定',
  theme: 'テーマ', themeAuto: '自動', themeDefault: '標準', themeSakura: '桜水彩', themeDark: 'ダーク',
  language: '言語', legal: '情報・規約', privacy: 'プライバシーポリシー', terms: '利用規約', rate: 'このアプリを評価',
  privacyUrl: 'https://safa-lang.com/ja/privacy/',
  termsUrl: 'https://safa-lang.com/ja/terms/',
  openError: 'リンクを開けませんでした。',
  dictSourceLabel: '辞書データの出典',
  resetIdle: 'データを初期化', resetArm: 'もう一度押すと初期化',
};

const TABLE: Record<string, Strings> = { en, ja };

export function strings(lang: string): Strings {
  return TABLE[lang] ?? en;
}

/** 現在の言語設定に対応する文言を返すフック。 */
export function useT(): Strings {
  const { settings } = useSettings();
  return strings(settings.language);
}
