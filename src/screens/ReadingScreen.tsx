// 長文タブ = JLPT 読解(本番形式)。レベル(N5/N4/N3)ボタン → 学習区分別に問題を配置。
// ナビゲーションは依存追加を避け、本コンポーネント内の state で home ⇄ quiz を切替。
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import {
  LEVELS, CATEGORY_LABELS_EN, categoriesForLevel, scriptsFor, questionCount, shuffle,
  type Level, type CatCode, type ReadingScript,
} from '../data/reading';
import { useReadingProgress } from '../store/readingProgress';
import { useT, type Strings } from '../i18n';

type Active = { level: Level; cat: CatCode; index: number };

export default function ReadingScreen() {
  const c = useColors();
  const t = useT();
  const s = useMemo(() => makeStyles(c), [c]);
  const [level, setLevel] = useState<Level>('N5');
  const [active, setActive] = useState<Active | null>(null);

  if (active) {
    const list = scriptsFor(active.level, active.cat);
    return (
      <QuizView
        s={s}
        c={c}
        t={t}
        level={active.level}
        cat={active.cat}
        script={list[active.index]}
        hasPrev={active.index > 0}
        hasNext={active.index < list.length - 1}
        onPrev={() => setActive({ ...active, index: active.index - 1 })}
        onNext={() => setActive({ ...active, index: active.index + 1 })}
        onClose={() => setActive(null)}
      />
    );
  }

  const cats = categoriesForLevel(level);
  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.head}>
        <Text style={s.tab}>{t.readingKicker}</Text>
        <Text style={s.title}>{t.readingTitle}</Text>
        <Text style={s.sub}>{t.readingSub}</Text>
      </View>

      {/* レベル選択 */}
      <View style={s.levelRow}>
        {LEVELS.map((lv) => {
          const on = lv === level;
          return (
            <Pressable key={lv} onPress={() => setLevel(lv)} style={[s.levelBtn, on && s.levelBtnOn]}>
              <Text style={[s.levelTxt, on && s.levelTxtOn]}>{lv}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {cats.map((cat) => {
          const scripts = scriptsFor(level, cat);
          return (
            <View key={cat} style={s.section}>
              <View style={s.secHead}>
                <Text style={s.secTitle}>{CATEGORY_LABELS_EN[cat]}</Text>
                <Text style={s.secCount}>{t.questionsCount(questionCount(level, cat))}</Text>
              </View>
              {scripts.map((sc, i) => (
                <Pressable key={sc.scriptId} style={s.card} onPress={() => setActive({ level, cat, index: i })}>
                  <View style={s.cardNo}><Text style={s.cardNoTxt}>{i + 1}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardText} numberOfLines={2}>{snippet(sc)}</Text>
                    <Text style={s.cardMeta}>
                      {sc.items.length > 1 ? t.nQuestions(sc.items.length) : t.oneQuestion}
                      {sc.charCount ? ` · ${t.passageChars(sc.charCount)}` : ''}
                    </Text>
                  </View>
                  <Text style={s.chev}>›</Text>
                </Pressable>
              ))}
            </View>
          );
        })}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function snippet(sc: ReadingScript): string {
  const body = (sc.passage || sc.items[0]?.question || '').replace(/\s+/g, ' ').trim();
  return body.length > 60 ? body.slice(0, 60) + '…' : body;
}

function QuizView({
  s, c, t, level, cat, script, hasPrev, hasNext, onPrev, onNext, onClose,
}: {
  s: ReturnType<typeof makeStyles>; c: ThemeColors; t: Strings;
  level: Level; cat: CatCode; script: ReadingScript;
  hasPrev: boolean; hasNext: boolean; onPrev: () => void; onNext: () => void; onClose: () => void;
}) {
  // 設問ごとに選択肢を一度だけシャッフル(script 切替で作り直す)
  const shuffled = useMemo(
    () => script.items.map((it) => shuffle(it.choices)),
    [script.scriptId],
  );
  const [picked, setPicked] = useState<Record<string, string>>({});
  const { markAnswered } = useReadingProgress();

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.qHead}>
        <Pressable onPress={onClose} hitSlop={10} style={s.back}><Text style={s.backTxt}>{t.list}</Text></Pressable>
        <Text style={s.qCrumb}>{level} · {CATEGORY_LABELS_EN[cat]}</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!!script.passage && (
          <View style={s.passage}>
            {script.charCount ? <Text style={s.passageMeta}>{t.passageChars(script.charCount)}</Text> : null}
            <Text style={s.passageTxt}>{script.passage}</Text>
          </View>
        )}

        {script.items.map((it, qi) => {
          const choices = shuffled[qi];
          const sel = picked[it.id];
          const answered = sel !== undefined;
          return (
            <View key={it.id} style={s.qBlock}>
              <Text style={s.qText}>
                {script.items.length > 1 ? t.qNo(qi + 1) : ''}{it.question}
              </Text>
              {choices.map((ch) => {
                const isAns = ch === it.answer;
                const isSel = ch === sel;
                const fill = answered && isAns ? s.choiceOk : answered && isSel ? s.choiceNg : null;
                const tt = answered && (isAns || isSel) ? s.choiceTxtOn : null;
                return (
                  <Pressable
                    key={ch}
                    disabled={answered}
                    onPress={() => { setPicked((p) => ({ ...p, [it.id]: ch })); markAnswered(it.id); }}
                    style={[s.choice, fill]}
                  >
                    <Text style={[s.choiceTxt, tt]}>{ch}</Text>
                    {answered && isAns ? <Text style={s.mark}>✓</Text> : null}
                    {answered && isSel && !isAns ? <Text style={s.markNg}>✕</Text> : null}
                  </Pressable>
                );
              })}
              {answered && !!(it.aimEn || it.aim) && (
                <View style={s.expl}>
                  <Text style={s.explLabel}>{t.focus}</Text>
                  <Text style={s.explTxt}>{it.aimEn || it.aim}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={s.navRow}>
          <Pressable disabled={!hasPrev} onPress={onPrev} style={[s.navBtn, !hasPrev && s.navBtnOff]}>
            <Text style={[s.navTxt, !hasPrev && s.navTxtOff]}>{t.prev}</Text>
          </Pressable>
          <Pressable disabled={!hasNext} onPress={onNext} style={[s.navBtn, !hasNext && s.navBtnOff]}>
            <Text style={[s.navTxt, !hasNext && s.navTxtOff]}>{t.next}</Text>
          </Pressable>
        </View>
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

    levelRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    levelBtn: {
      flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: radius.pill,
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.line,
    },
    levelBtnOn: { backgroundColor: c.blue, borderColor: c.blue },
    levelTxt: { fontSize: ty.body, fontWeight: '800', color: c.ink2 },
    levelTxtOn: { color: '#fff' },

    scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
    section: { marginTop: spacing.md },
    secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    secTitle: { fontSize: ty.h2, fontWeight: '800', color: c.ink },
    secCount: {
      fontSize: ty.small, fontWeight: '700', color: c.blueDark,
      backgroundColor: c.blueLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill,
    },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      padding: spacing.md, marginBottom: spacing.sm,
    },
    cardNo: {
      width: 28, height: 28, borderRadius: radius.pill, backgroundColor: c.bgSoft,
      alignItems: 'center', justifyContent: 'center',
    },
    cardNoTxt: { fontSize: ty.small, fontWeight: '800', color: c.mute },
    cardText: { fontSize: ty.body, color: c.ink2, lineHeight: 20 },
    cardMeta: { fontSize: ty.tiny, color: c.faint, marginTop: 4 },
    chev: { fontSize: 22, color: c.trace, fontWeight: '700' },

    // quiz
    qHead: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm,
      borderBottomWidth: 1, borderBottomColor: c.line,
    },
    back: { width: 56 },
    backTxt: { fontSize: ty.body, fontWeight: '700', color: c.blue },
    qCrumb: { fontSize: ty.small, fontWeight: '700', color: c.mute },
    passage: {
      backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      padding: spacing.md, marginTop: spacing.md,
    },
    passageMeta: { fontSize: ty.tiny, color: c.faint, marginBottom: spacing.xs },
    passageTxt: { fontSize: ty.body + 1, color: c.ink, lineHeight: 26 },
    qBlock: { marginTop: spacing.lg },
    qText: { fontSize: ty.body + 1, fontWeight: '800', color: c.ink, marginBottom: spacing.sm, lineHeight: 24 },
    choice: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.line,
      paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
    },
    choiceOk: { backgroundColor: c.okBg, borderColor: c.green },
    choiceNg: { backgroundColor: c.ngBg, borderColor: c.red },
    choiceTxt: { flex: 1, fontSize: ty.body, color: c.ink2, lineHeight: 22 },
    choiceTxtOn: { color: c.ink, fontWeight: '700' },
    mark: { fontSize: ty.body, fontWeight: '900', color: c.green, marginLeft: spacing.sm },
    markNg: { fontSize: ty.body, fontWeight: '900', color: c.red, marginLeft: spacing.sm },
    expl: {
      backgroundColor: c.bgSoft, borderRadius: radius.md, padding: spacing.sm + 2, marginTop: spacing.xs,
      borderLeftWidth: 3, borderLeftColor: c.amber,
    },
    explLabel: { fontSize: ty.tiny, fontWeight: '800', color: c.amber, marginBottom: 2 },
    explTxt: { fontSize: ty.small, color: c.ink2, lineHeight: 18 },

    navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    navBtn: {
      flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: radius.md,
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.blue,
    },
    navBtnOff: { borderColor: c.line },
    navTxt: { fontSize: ty.body, fontWeight: '800', color: c.blue },
    navTxtOff: { color: c.trace },
  });
