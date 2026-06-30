// 短文/長文タブ共通画面。アコーディオン（JLPT風プルダウン・各階層で開けるのは1つ＝別を開くと前は自動で閉じる）。
// 階層: カテゴリー ＞ サブテーマ ＞ (区分) ＞ タイトル → タップで本文（精聴/精読・問題なし）。
import { lazy, Suspense, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, useAppTheme, isGradientTheme, type ThemeColors } from '../theme';
import { useT, type Strings } from '../i18n';
import { useSettings } from '../store/settings';
import { nodesFor, label, formLabel, type ContentNode, type ContentItem } from '../data/content';
import { StoryBody } from '../components/StoryBody';
// 音声は詳細を開いた時だけ遅延ロード(起動経路に expo-av/audioMap を載せない)
const AudioButton = lazy(() => import('../components/AudioButton'));

export default function ContentScreen({ tab, kicker, title, sub }: {
  tab: string; kicker: string; title: string; sub: string;
}) {
  const c = useColors();
  const t = useT();
  const lang = useSettings().settings.language;
  const grad = isGradientTheme(useAppTheme());
  const s = useMemo(() => makeStyles(c, grad), [c, grad]);
  const [openPath, setOpenPath] = useState<string[]>([]);
  const [active, setActive] = useState<ContentItem | null>(null);

  if (active) return <Detail key={active.id} s={s} t={t} lang={lang} item={active} onClose={() => setActive(null)} />;

  // 各階層で開けるのは1つ。別を開くと同階層と配下を閉じる。
  const toggle = (level: number, name: string) =>
    setOpenPath((prev) => (prev[level] === name ? prev.slice(0, level) : [...prev.slice(0, level), name]));

  const renderNodes = (nodes: ContentNode[], level: number): React.ReactNode =>
    nodes.map((node) => {
      const open = openPath[level] === node.name;
      return (
        <View key={node.name}>
          <Pressable
            onPress={() => toggle(level, node.name)}
            style={[
              s.row, { marginLeft: level * spacing.md },
              level === 0 ? s.rowCat : s.rowNest,
              open && s.rowOpen,
            ]}
          >
            {level === 0 ? <Text style={[s.caret, open && s.caretOpen]}>{open ? '▾' : '▸'}</Text> : null}
            <Text style={[s.rowTxt, level === 0 && s.rowCatTxt, open && s.rowTxtOpen]} numberOfLines={2}>
              {label(node.name, lang)}
            </Text>
          </Pressable>

          {open && node.children ? renderNodes(node.children, level + 1) : null}

          {open && node.items
            ? node.items.map((it) => (
                <Pressable
                  key={it.id}
                  onPress={() => setActive(it)}
                  style={[s.item, { marginLeft: (level + 1) * spacing.md }]}
                >
                  <Text style={s.itemEmoji}>{emojiFor(it.form)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemTitle}>{it.title}</Text>
                    <Text style={s.itemMeta}>{formLabel(it.form, lang)}</Text>
                  </View>
                  <Text style={s.itemChev}>›</Text>
                </Pressable>
              ))
            : null}
        </View>
      );
    });

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.head}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.sub}>{sub}</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {renderNodes(nodesFor(tab), 0)}
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
    case 'ドキュメンタリー': return '🎬';
    default: return '🔊';
  }
}

function Detail({ s, t, lang, item, onClose }: {
  s: ReturnType<typeof makeStyles>; t: Strings; lang: string; item: ContentItem; onClose: () => void;
}) {
  const c = useColors();
  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.qHead}>
        <Pressable onPress={onClose} hitSlop={10} style={s.back}><Text style={s.backTxt}>{t.list}</Text></Pressable>
        <Text style={s.qCrumb} numberOfLines={1}>{formLabel(item.form, lang)}</Text>
        <View style={{ width: 56 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll2} showsVerticalScrollIndicator={false}>
        <Text style={s.dTitle}>{item.title}</Text>
        <Suspense fallback={<View style={s.audio}><Text style={s.audioIcon}>🔊</Text><Text style={s.audioTxt}>{t.audioComingSoon}</Text></View>}>
          <AudioButton id={item.id} />
        </Suspense>
        <View style={s.bodyCard}><StoryBody text={item.text} c={c} size={19} /></View>
        {!!item.en && (
          <View style={s.block}><Text style={s.blockLabel}>{t.translationLabel}</Text><Text style={s.enTxt}>{item.en}</Text></View>
        )}
        {!!item.key && (
          <View style={s.block}><Text style={s.blockLabel}>{t.keyPhrasesLabel}</Text><Text style={s.keyTxt}>{item.key}</Text></View>
        )}
        {!!item.point && (
          <View style={[s.block, s.useful]}><Text style={s.usefulLabel}>{t.pointLabel}</Text><Text style={s.usefulTxt}>{item.point}</Text></View>
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors, grad = false) => {
  // 水彩テーマでは半透明フロスト(背景が透ける)。単色テーマでは従来どおり不透明。
  const card = grad ? 'rgba(255,255,255,0.70)' : c.surface;
  const nest = grad ? 'rgba(255,255,255,0.48)' : c.bgSoft;
  const itemBg = grad ? 'rgba(255,255,255,0.56)' : c.bgSoft;
  const openBg = grad ? 'rgba(225,237,255,0.86)' : c.blueLight;
  const bord = grad ? 'rgba(255,255,255,0.75)' : c.line;
  const shadow = grad
    ? { shadowColor: '#5a4a66', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 }
    : { shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 };
  return StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    head: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
    tab: { fontSize: ty.small, fontWeight: '700', letterSpacing: 1, color: c.mute },
    title: { fontSize: 26, fontWeight: '800', color: c.ink, marginTop: spacing.xs, letterSpacing: 0.3 },
    sub: { fontSize: ty.small, color: c.mute, marginTop: spacing.xs, lineHeight: 18 },
    scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

    row: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      borderRadius: radius.lg, borderWidth: 1,
      paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
    },
    rowCat: { backgroundColor: card, borderColor: bord, paddingVertical: spacing.md + 2, ...shadow },
    rowNest: { backgroundColor: nest, borderColor: bord, borderRadius: radius.md, paddingVertical: spacing.sm + 3, marginLeft: spacing.sm },
    rowOpen: { borderColor: c.blue, backgroundColor: openBg },
    rowTxt: { flex: 1, fontSize: ty.body + 1, fontWeight: '700', color: c.ink2, letterSpacing: 0.2 },
    rowCatTxt: { fontSize: ty.h2 + 1, fontWeight: '800', color: c.ink, letterSpacing: 0.4 },
    rowTxtOpen: { color: c.blueDark },
    caret: { fontSize: ty.small, fontWeight: '800', color: c.faint, width: 14, textAlign: 'center' },
    caretOpen: { color: c.blue },

    item: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: itemBg, borderRadius: radius.md, paddingVertical: spacing.sm + 3, paddingLeft: spacing.sm, paddingRight: spacing.md,
      marginBottom: spacing.xs, marginLeft: spacing.sm,
    },
    itemEmoji: { fontSize: 19 },
    itemTitle: { fontSize: ty.body, fontWeight: '700', color: c.ink },
    itemMeta: { fontSize: ty.tiny, color: c.faint, marginTop: 1 },
    itemChev: { fontSize: 20, color: c.trace, fontWeight: '700' },

    // detail
    scroll2: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
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
    audioOn: { backgroundColor: c.blueLight, borderColor: c.blue },
    audioIcon: { fontSize: 22 },
    audioTxt: { fontSize: ty.small, color: c.mute, fontWeight: '700' },
    bodyCard: { backgroundColor: grad ? 'rgba(255,255,255,0.88)' : c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: grad ? 'rgba(255,255,255,0.8)' : c.line, padding: spacing.md },
    bodyTxt: { fontSize: ty.body + 3, color: c.ink, lineHeight: 30 },
    block: { marginTop: spacing.md },
    blockLabel: { fontSize: ty.tiny, fontWeight: '800', color: c.mute, letterSpacing: 0.5, marginBottom: spacing.xs },
    enTxt: { fontSize: ty.body, color: c.ink2, lineHeight: 22 },
    keyTxt: { fontSize: ty.body, color: c.ink2, lineHeight: 24, fontWeight: '600' },
    useful: { backgroundColor: c.blueLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
    usefulLabel: { fontSize: ty.tiny, fontWeight: '800', color: c.blueDark, marginBottom: 2 },
    usefulTxt: { fontSize: ty.small, color: c.ink2, lineHeight: 18 },
  });
};
