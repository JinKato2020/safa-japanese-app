// 短文/長文タブ共通の精聴・精読画面(問題形式なし)。カテゴリー ＞ サブテーマ ＞ タイトル ＞ 本文。
// ヒアリングがメインだが日本語本文も表示。依存追加を避け本コンポーネント内 state で list ⇄ detail を切替。
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import { useT, type Strings } from '../i18n';
import { categoriesFor, catLabel, subLabel, formLabel, type ContentItem } from '../data/content';

export default function ContentScreen({ tab, kicker, title, sub }: {
  tab: string; kicker: string; title: string; sub: string;
}) {
  const c = useColors();
  const t = useT();
  const s = useMemo(() => makeStyles(c), [c]);
  const cats = categoriesFor(tab);
  const [catIdx, setCatIdx] = useState(0);
  const [active, setActive] = useState<ContentItem | null>(null);

  if (active) {
    return <Detail s={s} t={t} item={active} onClose={() => setActive(null)} />;
  }

  const cat = cats[catIdx];
  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.head}>
        <Text style={s.tab}>{kicker}</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.sub}>{sub}</Text>
      </View>

      {/* カテゴリー選択 */}
      <View style={s.catRow}>
        {cats.map((k, i) => {
          const on = i === catIdx;
          return (
            <Pressable key={k.category} onPress={() => setCatIdx(i)} style={[s.catBtn, on && s.catBtnOn]}>
              <Text style={[s.catTxt, on && s.catTxtOn]} numberOfLines={2}>{catLabel(k.category)}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!cat || cat.subthemes.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🌸</Text>
            <Text style={s.emptyTxt}>{t.comingSoon}</Text>
          </View>
        ) : (
          cat.subthemes.map((st) => (
            <View key={st.sub} style={s.section}>
              <Text style={s.secTitle}>{subLabel(st.sub)}</Text>
              {st.items.map((it) => (
                <Pressable key={it.id} style={s.card} onPress={() => setActive(it)}>
                  <Text style={s.cardEmoji}>{emojiFor(it.form)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{it.title}</Text>
                    <Text style={s.cardMeta}>{formLabel(it.form)}</Text>
                  </View>
                  <Text style={s.chev}>›</Text>
                </Pressable>
              ))}
            </View>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function emojiFor(form: string): string {
  switch (form) {
    case '対話': return '💬';
    case '一人称': return '📖';
    case 'ニュース': return '📰';
    case '天気予報': return '☀️';
    case 'トーク': return '🎙️';
    case '解説': return '💡';
    case '物語': return '📕';
    default: return '🔊';
  }
}

function Detail({ s, t, item, onClose }: {
  s: ReturnType<typeof makeStyles>; t: Strings; item: ContentItem; onClose: () => void;
}) {
  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.qHead}>
        <Pressable onPress={onClose} hitSlop={10} style={s.back}><Text style={s.backTxt}>{t.list}</Text></Pressable>
        <Text style={s.qCrumb} numberOfLines={1}>{formLabel(item.form)}</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.dTitle}>{item.title}</Text>

        {/* 音声(メイン)プレースホルダ ※TTS生成は今後 */}
        <View style={s.audio}>
          <Text style={s.audioIcon}>🔊</Text>
          <Text style={s.audioTxt}>{t.audioComingSoon}</Text>
        </View>

        {/* 本文(日本語・精読/精聴の本体) */}
        <View style={s.bodyCard}>
          <Text style={s.bodyTxt}>{item.text}</Text>
        </View>

        {!!item.en && (
          <View style={s.block}>
            <Text style={s.blockLabel}>{t.translationLabel}</Text>
            <Text style={s.enTxt}>{item.en}</Text>
          </View>
        )}
        {!!item.key && (
          <View style={s.block}>
            <Text style={s.blockLabel}>{t.keyPhrasesLabel}</Text>
            <Text style={s.keyTxt}>{item.key}</Text>
          </View>
        )}
        {!!item.point && (
          <View style={[s.block, s.useful]}>
            <Text style={s.usefulLabel}>{t.pointLabel}</Text>
            <Text style={s.usefulTxt}>{item.point}</Text>
          </View>
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    head: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
    tab: { fontSize: ty.small, fontWeight: '700', letterSpacing: 1, color: c.mute },
    title: { fontSize: ty.h1, fontWeight: '800', color: c.ink, marginTop: spacing.xs },
    sub: { fontSize: ty.small, color: c.mute, marginTop: spacing.xs, lineHeight: 18 },

    catRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    catBtn: {
      flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs,
      borderRadius: radius.md, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line,
    },
    catBtnOn: { backgroundColor: c.blue, borderColor: c.blue },
    catTxt: { fontSize: ty.tiny, fontWeight: '800', color: c.ink2, textAlign: 'center' },
    catTxtOn: { color: '#fff' },

    scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
    section: { marginTop: spacing.md },
    secTitle: { fontSize: ty.h2, fontWeight: '800', color: c.ink, marginBottom: spacing.sm },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      padding: spacing.md, marginBottom: spacing.sm,
    },
    cardEmoji: { fontSize: 22 },
    cardTitle: { fontSize: ty.body, fontWeight: '800', color: c.ink },
    cardMeta: { fontSize: ty.tiny, color: c.faint, marginTop: 2 },
    chev: { fontSize: 22, color: c.trace, fontWeight: '700' },

    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
    emptyEmoji: { fontSize: 40 },
    emptyTxt: { fontSize: ty.body, color: c.mute, fontWeight: '700' },

    qHead: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm,
      borderBottomWidth: 1, borderBottomColor: c.line,
    },
    back: { width: 56 },
    backTxt: { fontSize: ty.body, fontWeight: '700', color: c.blue },
    qCrumb: { flex: 1, textAlign: 'center', fontSize: ty.small, fontWeight: '700', color: c.mute },
    dTitle: { fontSize: ty.h1, fontWeight: '800', color: c.ink, marginTop: spacing.md, marginBottom: spacing.sm },
    audio: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
      backgroundColor: c.bgSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      paddingVertical: spacing.md, marginBottom: spacing.md,
    },
    audioIcon: { fontSize: 22 },
    audioTxt: { fontSize: ty.small, color: c.mute, fontWeight: '700' },
    bodyCard: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line, padding: spacing.md },
    bodyTxt: { fontSize: ty.body + 3, color: c.ink, lineHeight: 30 },
    block: { marginTop: spacing.md },
    blockLabel: { fontSize: ty.tiny, fontWeight: '800', color: c.mute, letterSpacing: 0.5, marginBottom: spacing.xs },
    enTxt: { fontSize: ty.body, color: c.ink2, lineHeight: 22 },
    keyTxt: { fontSize: ty.body, color: c.ink2, lineHeight: 24, fontWeight: '600' },
    useful: { backgroundColor: c.blueLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
    usefulLabel: { fontSize: ty.tiny, fontWeight: '800', color: c.blueDark, marginBottom: 2 },
    usefulTxt: { fontSize: ty.small, color: c.ink2, lineHeight: 18 },
  });
