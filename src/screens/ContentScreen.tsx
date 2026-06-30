// 短文/長文タブ共通画面。アコーディオン（JLPT風プルダウン・各階層で開けるのは1つ＝別を開くと前は自動で閉じる）。
// 階層: カテゴリー ＞ サブテーマ ＞ (区分) ＞ タイトル → タップで本文（精聴/精読・問題なし）。
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import { useT, type Strings } from '../i18n';
import { useSettings } from '../store/settings';
import { nodesFor, label, formLabel, type ContentNode, type ContentItem } from '../data/content';
import { StoryBody } from '../components/StoryBody';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AUDIO } from '../data/audioMap';

export default function ContentScreen({ tab, kicker, title, sub }: {
  tab: string; kicker: string; title: string; sub: string;
}) {
  const c = useColors();
  const t = useT();
  const lang = useSettings().settings.language;
  const s = useMemo(() => makeStyles(c), [c]);
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
            <Text style={[s.caret, open && s.caretOpen]}>{open ? '▾' : '▸'}</Text>
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
  const source = AUDIO[item.id];
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);
  const playing = !!status?.playing;
  const toggleAudio = () => {
    if (!source) return;
    if (playing) { player.pause(); return; }
    if ((status?.currentTime ?? 0) >= (status?.duration ?? 0) - 0.15) player.seekTo(0);
    player.play();
  };
  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.qHead}>
        <Pressable onPress={onClose} hitSlop={10} style={s.back}><Text style={s.backTxt}>{t.list}</Text></Pressable>
        <Text style={s.qCrumb} numberOfLines={1}>{formLabel(item.form, lang)}</Text>
        <View style={{ width: 56 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll2} showsVerticalScrollIndicator={false}>
        <Text style={s.dTitle}>{item.title}</Text>
        {source ? (
          <Pressable onPress={toggleAudio} style={[s.audio, playing && s.audioOn]}>
            <Text style={s.audioIcon}>{playing ? '⏸️' : '▶️'}</Text>
            <Text style={s.audioTxt}>{playing ? t.audioPlaying : t.audioPlay}</Text>
          </Pressable>
        ) : (
          <View style={s.audio}>
            <Text style={s.audioIcon}>🔊</Text>
            <Text style={s.audioTxt}>{t.audioComingSoon}</Text>
          </View>
        )}
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

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    head: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
    tab: { fontSize: ty.small, fontWeight: '700', letterSpacing: 1, color: c.mute },
    title: { fontSize: ty.h1, fontWeight: '800', color: c.ink, marginTop: spacing.xs },
    sub: { fontSize: ty.small, color: c.mute, marginTop: spacing.xs, lineHeight: 18 },
    scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },

    row: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.line,
      paddingVertical: spacing.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
    },
    rowCat: { backgroundColor: c.surface, borderColor: c.line },
    rowNest: { backgroundColor: c.bgSoft, borderColor: c.line, borderLeftWidth: 3, borderLeftColor: c.trace, paddingVertical: spacing.sm + 2 },
    rowOpen: { borderColor: c.blue, borderLeftColor: c.blue, backgroundColor: c.blueLight },
    rowTxt: { flex: 1, fontSize: ty.body, fontWeight: '700', color: c.ink2 },
    rowCatTxt: { fontSize: ty.h2, fontWeight: '800', color: c.ink },
    rowTxtOpen: { color: c.blueDark },
    caret: { fontSize: ty.small, fontWeight: '800', color: c.faint, width: 14, textAlign: 'center' },
    caretOpen: { color: c.blue },

    item: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: c.bgSoft, borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingRight: spacing.md,
      marginBottom: spacing.xs,
    },
    itemEmoji: { fontSize: 18 },
    itemTitle: { fontSize: ty.small, fontWeight: '700', color: c.ink },
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
