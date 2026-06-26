// ホーム = ダッシュボード。あいさつ＋継続(週)＋各機能への導線。
// ※聴解(短文/長文)の中身は未実装。UIはまいにちJLPTと同一様式。
import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import { StreakWeek, type WeekDay } from '../../safa-shared/JLPT-Listening/design';
import { useDailyProgress, lastNDays } from '../../safa-shared/JLPT-Listening/design';

const WD = ['日', '月', '火', '水', '木', '金', '土'];

const LINKS: { tab: string; emoji: string; title: string; desc: string }[] = [
  { tab: '短文', emoji: '💬', title: '短文', desc: '短い文で聞き取りの基礎を鍛える' },
  { tab: '長文', emoji: '📖', title: '長文', desc: 'まとまった文章を聞いて理解する' },
  { tab: '辞書', emoji: '🔍', title: '辞書', desc: '語彙・漢字をいつでも調べる' },
];

export default function HomeScreen() {
  const nav = useNavigation<{ navigate: (name: string) => void }>();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const prog = useDailyProgress('safa-ja:progress');

  const week: WeekDay[] = useMemo(() => {
    const days = lastNDays(prog.today, 7);
    return days.map((d) => ({
      key: d,
      label: WD[new Date(d + 'T00:00:00').getDay()],
      on: prog.studied.has(d),
      today: d === prog.today,
    }));
  }, [prog.today, prog.studied]);

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.tab}>ホーム</Text>
        <Text style={s.title}>聞いて話せる日本語</Text>

        {/* あいさつ / コンセプト */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>聞いて、話せるように。</Text>
          <Text style={s.heroBody}>
            短文・長文のリスニングで「耳」を、辞書で「語彙」を育てます。毎日少しずつ続けましょう。
          </Text>
        </View>

        {/* 継続(週) */}
        <View style={s.card}>
          <View style={s.cardHeadRow}>
            <Text style={s.cardHead}>今週の学習</Text>
            <Text style={s.streakNum}>{prog.streak}<Text style={s.streakUnit}> 日連続</Text></Text>
          </View>
          <StreakWeek days={week} />
        </View>

        {/* 各機能への導線 */}
        <Text style={s.sectionH}>学習する</Text>
        {LINKS.map((l) => (
          <Pressable key={l.tab} style={s.linkCard} onPress={() => nav.navigate(l.tab)}>
            <Text style={s.linkEmoji}>{l.emoji}</Text>
            <View style={s.linkMain}>
              <Text style={s.linkTitle}>{l.title}</Text>
              <Text style={s.linkDesc}>{l.desc}</Text>
            </View>
            <Text style={s.chev}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    body: { padding: spacing.lg, gap: spacing.sm },
    tab: { fontSize: ty.small, fontWeight: '700', letterSpacing: 1, color: c.mute },
    title: { fontSize: ty.h1, fontWeight: '800', color: c.ink, marginTop: spacing.xs },
    hero: {
      backgroundColor: c.blueLight, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm,
    },
    heroTitle: { fontSize: ty.h2, fontWeight: '800', color: c.blueDark },
    heroBody: { fontSize: ty.small, color: c.ink2, marginTop: spacing.xs, lineHeight: 20 },
    card: {
      backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      padding: spacing.md, marginTop: spacing.sm, gap: spacing.md,
    },
    cardHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardHead: { fontSize: ty.small, fontWeight: '800', color: c.ink2 },
    streakNum: { fontSize: ty.h2, fontWeight: '800', color: c.orange },
    streakUnit: { fontSize: ty.tiny, fontWeight: '700', color: c.mute },
    sectionH: { fontSize: ty.small, fontWeight: '800', color: c.ink2, marginTop: spacing.md },
    linkCard: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md,
      backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      padding: spacing.md, marginTop: spacing.sm,
    },
    linkEmoji: { fontSize: 26 },
    linkMain: { flex: 1, gap: 2 },
    linkTitle: { fontSize: ty.body, fontWeight: '800', color: c.ink },
    linkDesc: { fontSize: ty.tiny, color: c.mute },
    chev: { fontSize: ty.h1, color: c.trace, fontWeight: '700' },
  });
