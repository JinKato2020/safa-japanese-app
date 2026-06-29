// ルビ表示。本文中の「漢字（かな）」を解析し、漢字の上に小さくふりがな(ルビ)を重ねて表示する。
// 入力例: "日本（にほん）に 着（つ）いた" → 日本/にほん をルビ表示、その他はそのまま。
// 改行(\n)で行を分け、各行は flexWrap で自然に折り返す(日本語は文字単位で改行)。
import { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

// 漢字(CJK統合漢字＋々〆ヶ)。ふりがなは ひらがな/カタカナ。
const KANJI = '\\u4E00-\\u9FFF\\u3005\\u3006\\u30F6';
const RUBY_RE = new RegExp(`([${KANJI}]+)（([\\u3040-\\u30FF]+)）`, 'g');
const PLAIN_RE = /[A-Za-z0-9]+|\s+|[\s\S]/g; // ASCII語は連結、空白は連結、その他は1文字

type Token = { t: 'r'; b: string; r: string } | { t: 'p'; s: string };

function pushPlain(out: Token[], s: string) {
  PLAIN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PLAIN_RE.exec(s))) out.push({ t: 'p', s: m[0] });
}

function tokenize(line: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  RUBY_RE.lastIndex = 0;
  while ((m = RUBY_RE.exec(line))) {
    if (m.index > last) pushPlain(out, line.slice(last, m.index));
    out.push({ t: 'r', b: m[1], r: m[2] });
    last = m.index + m[0].length;
  }
  if (last < line.length) pushPlain(out, line.slice(last));
  return out;
}

export interface RubyProps {
  text: string;
  size?: number;       // 本文(ベース)の文字サイズ
  color?: string;      // 本文の色
  rubyColor?: string;  // ふりがなの色
  style?: StyleProp<ViewStyle>;
}

export const Ruby = memo(function Ruby({ text, size = 18, color = '#0f172a', rubyColor = '#94a3b8', style }: RubyProps) {
  const lines = text.split('\n');
  const baseStyle = { fontSize: size, color, lineHeight: size * 1.12 };
  const rubyStyle = { fontSize: size * 0.5, color: rubyColor, lineHeight: size * 0.56 };
  return (
    <View style={style}>
      {lines.map((line, li) => {
        const toks = tokenize(line);
        if (toks.length === 0) return <View key={li} style={{ height: size * 0.9 }} />;
        return (
          <View key={li} style={styles.row}>
            {toks.map((tk, i) =>
              tk.t === 'r' ? (
                <View key={i} style={styles.ruby}>
                  <Text style={rubyStyle} numberOfLines={1}>{tk.r}</Text>
                  <Text style={baseStyle}>{tk.b}</Text>
                </View>
              ) : (
                <View key={i} style={styles.plain}>
                  <Text style={rubyStyle}> </Text>
                  <Text style={baseStyle}>{tk.s}</Text>
                </View>
              ),
            )}
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  // 折り返し時の行間は rowGap。ルビの分の高さも各行で確保される。
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', rowGap: 6 },
  ruby: { alignItems: 'center' },
  // 通常文字も「空ルビ＋本文」の縦積みにして、ルビ付き文字とベースラインをそろえる。
  plain: { alignItems: 'center' },
});
