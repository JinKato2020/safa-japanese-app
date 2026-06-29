// 短文/長文タブのコンテンツ（精聴・精読／問題なし）。正本= ../../コンテンツ.xlsx → conv_content.py → content.json。
// 構造: タブ(短文/長文) ＞ カテゴリー ＞ サブテーマ ＞ items。UIは英語。
import raw from './content.json';

export interface ContentItem {
  id: string;
  title: string;   // タイトル(日本語)
  form: string;    // 対話/一人称/ニュース/天気予報/トーク/解説/物語
  level: string;   // N5/N4/N3（アプリ非表示）
  text: string;    // 本文(精聴・精読の本体・ふりがな付)
  en: string;      // 英訳
  key: string;     // キー表現
  point: string;   // ポイント(実用/学習)
  note: string;    // 備考(音声)
}
export interface SubTheme { sub: string; items: ContentItem[] }
export interface Category { category: string; subthemes: SubTheme[] }

interface ContentDB {
  tabs: string[];
  data: Record<string, Category[]>;
}
const db = raw as unknown as ContentDB;

export const TABS = db.tabs;

export function categoriesFor(tab: string): Category[] {
  return db.data[tab] ?? [];
}

export const CATEGORY_LABEL_EN: Record<string, string> = {
  // 短文
  '生活力': 'Life Skills',
  '使えるひとこと': 'Useful Phrases',
  'ことば遊び': 'Word Fun',
  // 長文
  'ラジオトーク': 'Radio Talk',
  '物語': 'Stories',
  '文化と本音': 'Culture & Real Talk',
};

export const SUBTHEME_LABEL_EN: Record<string, string> = {
  // 生活力
  '買い物・お金': 'Shopping & Money',
  '手続き': 'Procedures',
  'しごと・学校': 'Work & School',
  '移動': 'Getting Around',
  // 使えるひとこと
  '依頼・許可・断り': 'Requests & Refusals',
  'お礼・謝罪': 'Thanks & Apologies',
  '気持ち・相づち': 'Reactions & Feelings',
  // ことば遊び
  '今日の擬音語': 'Onomatopoeia',
  'ことわざ・慣用句': 'Sayings & Idioms',
  'カタカナ語': 'Katakana Words',
  // ラジオトーク
  'ニュース': 'News',
  'お便り相談室': 'Listener Mail',
  'ゲストインタビュー': 'Guest Interview',
  '2人のフリートーク': 'Free Talk',
  // 物語
  'カイのストーリー': "Kai's Story",
  '昔話': 'Folk Tales',
  '日本語ミステリー': 'Japanese Mystery',
  '怖い話': 'Scary Stories',
  'ドキュメンタリー': 'Documentary',
  // 文化と本音
  '本音講座': 'Real Talk',
  'あるある': 'Japan Quirks',
  '食べもの': 'Food',
};

export const FORM_LABEL_EN: Record<string, string> = {
  '対話': 'Dialogue',
  '一人称': 'First-person',
  'ニュース': 'News',
  '天気予報': 'Weather',
  'トーク': 'Talk',
  '解説': 'Explainer',
  '物語': 'Story',
  '読み物': 'Reading',
  'ドキュメンタリー': 'Documentary',
};

export const catLabel = (c: string) => CATEGORY_LABEL_EN[c] ?? c;
export const subLabel = (s: string) => SUBTHEME_LABEL_EN[s] ?? s;
export const formLabel = (f: string) => FORM_LABEL_EN[f] ?? f;
