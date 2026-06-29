// 長文タブの仮画面(準備中)。中身(多読・多聴)は今後実装。
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';

function Placeholder({ tab, emoji, title, desc }: { tab: string; emoji: string; title: string; desc: string }) {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.head}>
        <Text style={s.tab}>{tab}</Text>
        <Text style={s.title}>{title}</Text>
      </View>
      <View style={s.center}>
        <Text style={s.emoji}>{emoji}</Text>
        <Text style={s.h}>Coming soon</Text>
        <Text style={s.p}>{desc}</Text>
      </View>
    </SafeAreaView>
  );
}

export function LongReadingScreen() {
  return <Placeholder tab="LONG" emoji="📖" title="Extensive Reading & Listening" desc="Longer stories and listening (1 / 3 / 10 min) are on the way." />;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    head: { padding: spacing.lg },
    tab: { fontSize: ty.small, fontWeight: '700', letterSpacing: 1, color: c.mute },
    title: { fontSize: ty.h1, fontWeight: '800', color: c.ink, marginTop: spacing.xs },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
    emoji: { fontSize: 48 },
    h: { fontSize: ty.h2, fontWeight: '800', color: c.ink2 },
    p: {
      fontSize: ty.small, color: c.mute, textAlign: 'center', lineHeight: 20,
      backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      padding: spacing.md, marginTop: spacing.sm,
    },
  });
