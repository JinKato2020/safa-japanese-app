// ホーム = 継続ダッシュボード。学習導線ボタンは置かず、継続カード＋連続学習バッジで「続ける動機」を中心に据える。
// UI様式はまいにちJLPTと同一(共有デザイン部品を使用)。
import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import {
  Card, StatRow, StreakWeek, StreakCalendar, BadgeGrid,
  type WeekDay, type CalDay, type BadgeItem,
  useDailyProgress, lastNDays,
} from '../../safa-shared/JLPT-Listening/design';
import Ring from '../components/Ring';
import { useReadingProgress } from '../store/readingProgress';

const WD = ['日', '月', '火', '水', '木', '金', '土'];

// 連続学習バッジの段階(獲得は「最長連続」基準＝一度取れば消えない)。
const STREAK_TIERS: { id: string; emoji: string; label: string; days: number }[] = [
  { id: 'd3', emoji: '🔥', label: '3日連続', days: 3 },
  { id: 'd7', emoji: '🌱', label: '1週間', days: 7 },
  { id: 'd14', emoji: '⭐', label: '2週間', days: 14 },
  { id: 'd30', emoji: '🏅', label: '1ヶ月', days: 30 },
  { id: 'd60', emoji: '💎', label: '2ヶ月', days: 60 },
  { id: 'd100', emoji: '👑', label: '100日', days: 100 },
];

export default function HomeScreen() {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const prog = useDailyProgress('safa-ja:progress');
  const { coverage } = useReadingProgress();
  const ringColor: Record<string, string> = { N5: c.green, N4: c.blue, N3: c.purple };

  const week: WeekDay[] = useMemo(() => {
    return lastNDays(prog.today, 7).map((d) => ({
      key: d,
      label: WD[new Date(d + 'T00:00:00').getDay()],
      on: prog.studied.has(d),
      today: d === prog.today,
    }));
  }, [prog.today, prog.studied]);

  const cal: CalDay[] = useMemo(() => {
    return lastNDays(prog.today, 35).map((d) => ({
      key: d,
      on: prog.studied.has(d),
      today: d === prog.today,
    }));
  }, [prog.today, prog.studied]);

  const best = Math.max(prog.streak, prog.longest);
  const badges: BadgeItem[] = STREAK_TIERS.map((t) => ({
    id: t.id,
    emoji: t.emoji,
    label: t.label,
    hint: `${t.days}日連続で獲得`,
    unlocked: best >= t.days,
  }));
  const earned = badges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.tab}>ホーム</Text>
        <Text style={s.title}>聞いて話せる日本語</Text>

        {/* あいさつ / コンセプト */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>毎日つづけて、力にする。</Text>
          <Text style={s.heroBody}>
            学習した日は自動で記録されます。連続記録をのばして、バッジを集めましょう。
          </Text>
        </View>

        {/* レベル別カバー率(読解) */}
        <Card style={s.block}>
          <Text style={s.cardHead}>レベル別カバー率（読解）</Text>
          <View style={s.ringRow}>
            {coverage.map((cv) => (
              <View key={cv.level} style={s.ringItem}>
                <Ring
                  ratio={cv.ratio}
                  color={ringColor[cv.level]}
                  centerTop={`${Math.round(cv.ratio * 100)}%`}
                  centerBottom={cv.level}
                />
                <Text style={s.ringMeta}>{cv.done}/{cv.total}問</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* 継続カード */}
        <Card style={s.block}>
          <Text style={s.cardHead}>学習の記録</Text>
          <StatRow
            stats={[
              { value: `${prog.streak}`, label: '連続(日)' },
              { value: `${prog.longest}`, label: '最長(日)' },
              { value: `${prog.totalDays}`, label: '累計(日)' },
            ]}
          />
          <View style={s.divider} />
          <Text style={s.subHead}>今週</Text>
          <StreakWeek days={week} />
          <View style={s.divider} />
          <Text style={s.subHead}>この5週間</Text>
          <StreakCalendar days={cal} />
        </Card>

        {/* 連続学習バッジ */}
        <Card style={s.block}>
          <View style={s.cardHeadRow}>
            <Text style={s.cardHead}>連続学習バッジ</Text>
            <Text style={s.badgeCount}>{earned}/{STREAK_TIERS.length}</Text>
          </View>
          <BadgeGrid badges={badges} achievedLabel="獲得済み" />
        </Card>
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
    hero: { backgroundColor: c.blueLight, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm },
    heroTitle: { fontSize: ty.h2, fontWeight: '800', color: c.blueDark },
    heroBody: { fontSize: ty.small, color: c.ink2, marginTop: spacing.xs, lineHeight: 20 },
    block: { marginTop: spacing.sm, gap: spacing.md },
    cardHead: { fontSize: ty.small, fontWeight: '800', color: c.ink2 },
    cardHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    badgeCount: {
      fontSize: ty.small, fontWeight: '800', color: c.blueDark,
      backgroundColor: c.blueLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill,
    },
    subHead: { fontSize: ty.tiny, fontWeight: '700', color: c.mute, letterSpacing: 0.5 },
    divider: { height: 1, backgroundColor: c.line },
    ringRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    ringItem: { alignItems: 'center', gap: spacing.xs },
    ringMeta: { fontSize: ty.tiny, color: c.mute, fontWeight: '700' },
  });
