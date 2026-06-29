// 短文タブのコンテンツ（精聴・精読／問題なし）。正本= ../../コンテンツ.xlsx を conv_content.py で content.json 化。
// カテゴリー(生活力向上/日本文化/1分リスニング) ＞ 場面(分野) ＞ タイトル(items)。UIは英語。
import raw from './content.json';

export interface ContentItem {
  id: string;
  title: string;       // タイトル(日本語)
  form: string;        // 対話 / 一人称 / ニュース / 天気予報 / アナウンス
  level: string;       // N5/N4/N3（アプリ非表示）
  text: string;        // 本文(精聴・精読の本体・ふりがな付)
  en: string;          // 英訳
  key: string;         // キー表現
  practical: string;   // 実用ポイント
  note: string;        // 備考(音声)
}
export interface ContentGroup { group: string; items: ContentItem[] }

interface ContentDB {
  categoryOrder: string[];
  data: Record<string, ContentGroup[]>;
}
const db = raw as unknown as ContentDB;

export const CATEGORY_ORDER = db.categoryOrder;

/** カテゴリーの英語ラベル。 */
export const CATEGORY_LABEL_EN: Record<string, string> = {
  '生活力向上': 'Life Skills',
  '日本文化': 'Japanese Culture',
  '1分リスニング': '1-Minute Listening',
};

/** 場面(分野)の英語ラベル。未登録は日本語名をそのまま表示。 */
export const GROUP_LABEL_EN: Record<string, string> = {
  '買い物・店': 'Shopping',
  '飲食店': 'Restaurants & Cafes',
  'コンビニ': 'Convenience Store',
  '駅・電車': 'Stations & Trains',
  '銀行': 'Bank',
  '郵便局': 'Post Office',
  '市役所': 'City Hall',
  '病院': 'Hospital & Pharmacy',
  'スマホ・通信': 'Phone & Internet',
  '住宅': 'Housing',
  '仕事': 'Work',
  '学校・日本語': 'School & Japanese',
  '美容院': 'Hair Salon',
  '人づきあい': 'Friends & Manners',
  '道案内': 'Directions',
  '1分リスニング': '1-Minute Listening',
};

/** 形式の英語ラベル。 */
export const FORM_LABEL_EN: Record<string, string> = {
  '対話': 'Dialogue',
  '一人称': 'First-person',
  'ニュース': 'News',
  '天気予報': 'Weather',
  'アナウンス': 'Announcement',
};

export function groupsFor(category: string): ContentGroup[] {
  return db.data[category] ?? [];
}
export function itemCount(category: string): number {
  return groupsFor(category).reduce((n, g) => n + g.items.length, 0);
}
export function groupLabel(group: string): string {
  return GROUP_LABEL_EN[group] ?? group;
}
export function formLabel(form: string): string {
  return FORM_LABEL_EN[form] ?? form;
}
