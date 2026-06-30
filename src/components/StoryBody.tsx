// 物語/長文の本文表示。括弧書きの「（ナレーション）」をやめ、構造を見やすく整える。
//  ・ナレーション → 左罫つきの落ち着いた地の文(ミュート色)
//  ・会話 → 話者名のカラーチップ＋本文(話者ごとに色分け)
//  ・心の声 → 小さな「心の声」タグ＋やわらかい色
//  ・各行のふりがなは Ruby でルビ表示。
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, radius, type ThemeColors } from '../theme';
import { Ruby } from './Ruby';

const SPK_COLORS = ['#2563eb', '#db2777', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#b45309'];
function speakerColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SPK_COLORS[h % SPK_COLORS.length];
}

export const StoryBody = memo(function StoryBody({ text, c, size = 19 }: { text: string; c: ThemeColors; size?: number }) {
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        if (!line.trim()) return <View key={i} style={{ height: size * 0.6 }} />;

        // ナレーション(（ナレーション）ラベルは消して地の文として表示・縦線なし)
        if (line.startsWith('（ナレーション）')) {
          const content = line.replace(/^（ナレーション）/, '').trim();
          return (
            <View key={i} style={s.narr}>
              <Ruby text={content} size={size - 2} color={c.mute} rubyColor={c.faint} />
            </View>
          );
        }

        // 会話(話者：本文)。話者名のふりがな（漢字（かな）：）も確実に検出する。
        const m = line.match(/^([^：]{1,16})：(.*)$/);
        const sp = m ? m[1].replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim() : '';
        if (m && sp && sp.length <= 10 && !/[、。\s]/.test(sp)) {
          let rest = m[2];
          const thought = rest.startsWith('（心の声）');
          rest = rest.replace(/^（心の声）/, '').trim();
          const col = speakerColor(sp);
          return (
            <View key={i} style={s.diaRow}>
              <Text style={[s.spk, { color: col, borderColor: col, marginTop: size * 0.5 }]} numberOfLines={1}>{sp}</Text>
              <View style={{ flex: 1 }}>
                {thought ? <Text style={[s.thoughtTag, { color: c.faint }]}>心の声</Text> : null}
                <Ruby text={rest} size={size} color={thought ? c.mute : c.ink} rubyColor={c.mute} />
              </View>
            </View>
          );
        }

        // それ以外(読み物などの地の文)
        return (
          <View key={i} style={{ marginVertical: 4 }}>
            <Ruby text={line} size={size} color={c.ink} rubyColor={c.mute} />
          </View>
        );
      })}
    </View>
  );
});

const s = StyleSheet.create({
  narr: { marginVertical: spacing.sm },
  diaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginVertical: spacing.sm },
  spk: { fontSize: 12, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderRadius: radius.pill },
  thoughtTag: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
});
