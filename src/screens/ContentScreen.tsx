// 短文/長文タブ共通画面。アコーディオン（JLPT風プルダウン・各階層で開けるのは1つ＝別を開くと前は自動で閉じる）。
// 階層: カテゴリー ＞ サブテーマ ＞ (区分) ＞ タイトル → タップで本文（精聴/精読・問題なし）。
import { lazy, Suspense, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, useAppTheme, isGradientTheme, type ThemeColors } from '../theme';
import { useT, type Strings } from '../i18n';
import { useSettings } from '../store/settings';
import { nodesFor, label, formLabel, type ContentNode, type ContentItem } from '../data/content';
import { StoryBody } from '../components/StoryBody';
import { ILLUST } from '../data/illustMap';
// 音声は詳細を開いた時だけ遅延ロード(起動経路に expo-av/audioMap を載せない)
const AudioButton = lazy(() => import('../components/AudioButton'));

export default function ContentScreen({ tab, kicker, title, sub }: {
  tab: string; kicker: string; title: string; sub: string;
}) {
  const c = useColors();
  const t = useT();
  const { language: lang, listStyle } = useSettings().settings;
  const st = listStyle === 'C' ? 'C' : 'B';
  const grad = isGradientTheme(useAppTheme());
  const s = useMemo(() => makeStyles(c, grad, st), [c, grad, st]);
  const [openPath, setOpenPath] = useState<string[]>([]);
  const [active, setActive] = useState<ContentItem | null>(null);

  if (active) return <Detail key={active.id} s={s} t={t} lang={lang} item={active} onClose={() => setActive(null)} />;

  // 各階層で開けるのは1つ。別を開くと同階層と配下を閉じる。
  const toggle = (level: number, name: string) =>
    setOpenPath((prev) => (prev[level] === name ? prev.slice(0, level) : [...prev.slice(0, level), name]));

  const renderNodes = (nodes: ContentNode[], level: number): React.ReactNode =>
    nodes.map((node) => {
      const open = openPath[level] === node.name;
      const isCat = level === 0;
      return (
        <View key={node.name}>
          <Pressable
            onPress={() => toggle(level, node.name)}
            style={({ pressed }) => [
              isCat ? s.cat : s.nest,
              !isCat && { marginLeft: level * spacing.md },
              open && (isCat ? s.catOpen : s.nestOpen),
              pressed && s.pressed,
            ]}
          >
            {isCat && st === 'B' ? <View style={[s.dot, open && s.dotOpen]} /> : null}
            <Text style={[isCat ? s.catTxt : s.nestTxt, open && s.txtOpen]} numberOfLines={2}>
              {label(node.name, lang)}
            </Text>
            <Text style={[s.chev, open && s.chevOpen]}>{open ? '▾' : '▸'}</Text>
          </Pressable>

          {open && node.children ? renderNodes(node.children, level + 1) : null}

          {open && node.items
            ? node.items.map((it, i) => (
                <Pressable
                  key={it.id}
                  onPress={() => setActive(it)}
                  style={({ pressed }) => [s.item, { marginLeft: (level + 1) * spacing.md }, pressed && s.itemPressed]}
                >
                  <Text style={s.itemNo}>{String(i + 1).padStart(2, '0')}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemTitle} numberOfLines={2}>{it.title}</Text>
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

function Detail({ s, t, lang, item, onClose }: {
  s: ReturnType<typeof makeStyles>; t: Strings; lang: string; item: ContentItem; onClose: () => void;
}) {
  const c = useColors();
  const illustSrc = ILLUST[item.id];
  const illustRatio = illustSrc ? (() => { const a = Image.resolveAssetSource(illustSrc); return a && a.height ? a.width / a.height : 0.74; })() : 0;
  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.qHead}>
        <Pressable onPress={onClose} hitSlop={10} style={s.back}><Text style={s.backTxt}>{t.list}</Text></Pressable>
        <Text style={s.qCrumb} numberOfLines={1}>{formLabel(item.form, lang)}</Text>
        <View style={{ width: 56 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll2} showsVerticalScrollIndicator={false}>
        <Text style={s.dTitle}>{item.title}</Text>
        {illustSrc ? <Image source={illustSrc} style={[s.illust, { aspectRatio: illustRatio }]} resizeMode="contain" /> : null}
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

const makeStyles = (c: ThemeColors, grad = false, st: 'B' | 'C' = 'B') => {
  const isC = st === 'C';
  // フォント: B=明朝(Shippori Mincho) / C=教科書体(Klee One)。番号・三角は素の小さいスタイル(B/C共通)。
  const titleFam = isC ? 'KleeOne-SemiBold' : 'ShipporiMincho-Bold';
  const titleFamR = isC ? 'KleeOne-Regular' : 'ShipporiMincho-Regular';
  const cardBg = grad ? 'rgba(255,255,255,0.7)' : c.surface;
  const cardBord = grad ? 'rgba(255,255,255,0.9)' : c.line;
  const itemBg = grad ? 'rgba(255,255,255,0.66)' : c.surface;
  const openBg = grad ? 'rgba(225,237,255,0.78)' : c.blueLight;
  const soft = { shadowColor: '#1e3a8a', shadowOpacity: grad ? 0.06 : 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 };
  // B=罫線ミニマル(透明・下罫線) / C=フロスト浮きカード
  const catBox = isC
    ? { backgroundColor: cardBg, borderRadius: radius.lg, borderWidth: grad ? StyleSheet.hairlineWidth : 1, borderColor: cardBord, paddingVertical: spacing.md + 2, paddingHorizontal: spacing.md, marginTop: spacing.sm, marginBottom: spacing.xs, ...soft }
    : { borderBottomWidth: 2, borderBottomColor: c.ink, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.xs, marginTop: spacing.md, marginBottom: spacing.xs };
  const nestBox = isC
    ? { backgroundColor: grad ? 'rgba(255,255,255,0.44)' : c.bgSoft, borderRadius: radius.md, borderWidth: grad ? StyleSheet.hairlineWidth : 1, borderColor: grad ? 'rgba(255,255,255,0.75)' : c.line, paddingVertical: spacing.sm + 3, paddingHorizontal: spacing.md, marginTop: spacing.xs, marginBottom: spacing.xs }
    : { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xs, marginTop: spacing.xs, marginBottom: spacing.xs };
  const itemBox = isC
    ? { backgroundColor: itemBg, borderRadius: radius.md, borderWidth: grad ? StyleSheet.hairlineWidth : 1, borderColor: grad ? 'rgba(255,255,255,0.82)' : c.line, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.md, marginTop: spacing.xs, marginBottom: spacing.xs, ...soft, shadowOpacity: grad ? 0.05 : 0.06, shadowRadius: 7, elevation: 1 }
    : { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line, paddingVertical: spacing.sm + 5, paddingHorizontal: spacing.xs };
  return StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    head: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
    tab: { fontSize: ty.small, fontWeight: '700', letterSpacing: 1, color: c.mute },
    title: { fontSize: 26, fontWeight: '700', color: c.ink, marginTop: spacing.xs, letterSpacing: 0.5 },
    sub: { fontSize: ty.small, color: c.mute, marginTop: spacing.xs, lineHeight: 18 },
    scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

    // カテゴリー
    cat: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, ...catBox },
    catOpen: isC ? { backgroundColor: openBg, borderColor: c.blue } : { borderBottomColor: c.blue },
    catTxt: { flex: 1, fontFamily: titleFam, fontSize: ty.h2 + 3, color: c.ink, letterSpacing: 0.8 },
    dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: c.blue },
    dotOpen: { backgroundColor: c.blueDark },

    // サブテーマ
    nest: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, ...nestBox },
    nestOpen: isC ? { backgroundColor: openBg, borderColor: c.blue } : { borderBottomColor: c.blue },
    nestTxt: { flex: 1, fontFamily: titleFamR, fontSize: ty.body + 2, color: c.ink2 },
    txtOpen: { color: c.blueDark },

    // 開閉三角(小さい素の▾/▸・B/C共通)
    chev: { fontSize: ty.small + 1, color: c.mute, marginLeft: spacing.xs },
    chevOpen: { color: c.blue },
    pressed: { opacity: 0.86 },

    // 項目(枠なし番号「01」＋小さい›)
    item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...itemBox },
    itemPressed: isC ? { backgroundColor: openBg, borderColor: c.blue } : { backgroundColor: openBg },
    itemNo: { fontSize: ty.small, color: c.blue, fontWeight: '700', minWidth: 22 },
    itemTitle: { fontSize: ty.body + 3, fontFamily: titleFamR, color: c.ink, letterSpacing: 0.3 },
    itemMeta: { fontSize: ty.tiny, color: c.faint, marginTop: 2, fontWeight: '600' },
    itemChev: { fontSize: 18, color: c.faint, fontWeight: '700', marginLeft: spacing.xs },

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
    illust: { width: '100%', borderRadius: radius.lg, marginBottom: spacing.md, backgroundColor: '#ffffff', borderWidth: 1, borderColor: grad ? 'rgba(255,255,255,0.85)' : c.line },
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
