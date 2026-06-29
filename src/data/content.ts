// 短文/長文タブのコンテンツ（精聴・精読／問題なし）。正本= ../../コンテンツ.xlsx → conv_content.py → content.json。
// ツリー構造: タブ ＞ カテゴリー ＞ サブテーマ ＞ (区分) ＞ items。UIは英語ラベル。
import raw from './content.json';

export interface ContentItem {
  id: string;      // 例 L-S-K-J-001（タブ-カテゴリー-サブテーマ-区分-連番）
  title: string;
  form: string;
  level: string;   // N5/N4/N3（アプリ非表示）
  text: string;
  en: string;
  key: string;
  point: string;
  note: string;
}
export interface ContentNode {
  name: string;              // 日本語のキー名（ラベルは label() で英語化）
  children?: ContentNode[];  // 入れ子（カテゴリー/サブテーマ/区分）
  items?: ContentItem[];     // 末端の本文リスト
}

interface DB { tabs: string[]; data: Record<string, ContentNode[]> }
const db = raw as unknown as DB;

export const TABS = db.tabs;
export function nodesFor(tab: string): ContentNode[] {
  return db.data[tab] ?? [];
}

// 階層名（カテゴリー/サブテーマ/区分）の英語ラベル。未登録は日本語名をそのまま。
export const LABEL_EN: Record<string, string> = {
  // カテゴリー(短文)
  '生活力': 'Life Skills',
  '文化': 'Culture',
  '本音講座': 'Real Talk',
  '日本と世界の違い': 'Japan vs the World',
  '使える一言': 'Useful Phrases',
  'グルメ': 'Food & Gourmet',
  '言葉遊び': 'Word Fun',
  // カテゴリー(長文)
  'カイの物語': "Kai's Story",
  'ラジオトーク': 'Radio Talk',
  'ミステリー': 'Mystery',
  'ドキュメンタリー': 'Documentary',
  '昔話': 'Folk Tales',
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
  // カイの物語 4区分
  '日本生活スタート': 'Life in Japan: Start',
  '日本一人旅': 'Solo Trip',
  'カイの日常': "Kai's Daily Life",
  'カイの休憩室': "Kai's Break Room",
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

// lang==='ja' は日本語名(キー)をそのまま表示。それ以外は英語ラベル。
export const label = (n: string, lang = 'en') => (lang === 'ja' ? n : LABEL_EN[n] ?? n);
export const formLabel = (f: string, lang = 'en') => (lang === 'ja' ? f : FORM_LABEL_EN[f] ?? f);
