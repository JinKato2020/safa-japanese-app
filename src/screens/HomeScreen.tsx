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
import { useT } from '../i18n';

const WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// 連続学習バッジの段階(獲得は「最長連続」基準＝一度取れば消えない)。
const STREAK_TIERS: { id: string; emoji: string; days: number }[] = [
  { id: 'd3', emoji: '🔥', days: 3 },
  { id: 'd7', emoji: '🌱', days: 7 },
  { id: 'd14', emoji: '⭐', days: 14 },
  { id: 'd30', emoji: '🏅', days: 30 },
  { id: 'd60', emoji: '💎', days: 60 },
  { id: 'd100', emoji: '👑', days: 100 },
];

export default function HomeScreen() {
  const c = useColors();
  const t = useT();
  const s = useMemo(() => makeStyles(c), [c]);
  const prog = useDailyProgress('safa-ja:progress');
  const badgeLabel: Record<string, string> = {
    d3: t.badge3, d7: t.badge7, d14: t.badge14, d30: t.badge30, d60: t.badge60, d100: t.badge100,
  };

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
  const badges: BadgeItem[] = STREAK_TIERS.map((tier) => ({
    id: tier.id,
    emoji: tier.emoji,
    label: badgeLabel[tier.id],
    hint: t.badgeHint(tier.days),
    unlocked: best >= tier.days,
  }));
  const earned = badges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.tab}>{t.homeKicker}</Text>
        <Text style={s.title}>{t.appName}</Text>

        {/* あいさつ / コンセプト */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>{t.heroTitle}</Text>
          <Text style={s.heroBody}>{t.heroBody}</Text>
        </View>

        {/* 継続カード */}
        <Card style={s.block}>
          <Text style={s.cardHead}>{t.recordTitle}</Text>
          <StatRow
            stats={[
              { value: `${prog.streak}`, label: t.statStreak },
              { value: `${prog.longest}`, label: t.statLongest },
              { value: `${prog.totalDays}`, label: t.statTotal },
            ]}
          />
          <View style={s.divider} />
          <Text style={s.subHead}>{t.thisWeek}</Text>
          <StreakWeek days={week} />
          <View style={s.divider} />
          <Text style={s.subHead}>{t.last5weeks}</Text>
          <StreakCalendar days={cal} />
        </Card>

        {/* 連続学習バッジ */}
        <Card style={s.block}>
          <View style={s.cardHeadRow}>
            <Text style={s.cardHead}>{t.badgesTitle}</Text>
            <Text style={s.badgeCount}>{earned}/{STREAK_TIERS.length}</Text>
          </View>
          <BadgeGrid badges={badges} achievedLabel={t.badgeEarned} />
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
  });
