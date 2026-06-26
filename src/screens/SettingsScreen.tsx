// 設定タブ。テーマ切替＋辞書の出典表示＋バージョン/Build番号＋リセット。
// 様式はまいにちJLPT ProfileScreen と同一。学習設定(目標級・母語・リマインダ等)は機能追加に合わせて拡張する。
import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import { useSettings, type ThemeMode } from '../store/settings';
import { DICT_BASE_URL } from '../../safa-shared/JLPT-Listening/dict/dictRemote';

// 共有辞書の出典（safa-shared/JLPT-Listening の正本に準拠。帰属表示は必須）。
const DICT_SOURCE = 'JMdict / KANJIDIC2（EDRDG, CC BY-SA）・日本語WordNet（NICT）・例文 Tatoeba/田中コーパス';

const THEMES: { v: ThemeMode; label: string }[] = [
  { v: 'light', label: 'ライト' },
  { v: 'dark', label: 'ダーク' },
  { v: 'auto', label: '自動' },
];

export default function SettingsScreen() {
  const { settings, setSettings, reset } = useSettings();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.tab}>設定</Text>
        <Text style={s.title}>設定</Text>

        {/* 表示設定 */}
        <View style={s.card}>
          <Text style={s.setLbl}>テーマ</Text>
          <View style={s.chipRow}>
            {THEMES.map((th) => (
              <Pressable key={th.v} onPress={() => setSettings({ theme: th.v })} style={[s.chip, settings.theme === th.v && s.chipOn]}>
                <Text style={[s.chipTxt, settings.theme === th.v && s.chipTxtOn]}>{th.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 出典・リセット */}
        <View style={s.card}>
          <Text style={s.setLbl}>辞書データの出典</Text>
          <Text style={s.credit}>{DICT_SOURCE}{'\n'}配信元: {DICT_BASE_URL}</Text>
          <Pressable
            onPress={() => {
              if (confirmReset) { reset(); setConfirmReset(false); } else { setConfirmReset(true); }
            }}
            style={[s.resetBtn, confirmReset && s.resetBtnArm]}
          >
            <Text style={[s.resetTxt, confirmReset && s.resetTxtArm]}>
              {confirmReset ? 'もう一度押すと初期化' : 'データを初期化'}
            </Text>
          </Pressable>
        </View>

        {/* バージョン＋Build番号(全セッション共通ルール: 画面に版を表示) */}
        <Text style={s.version}>
          v{Application.nativeApplicationVersion ?? '0.1.0'} (build {Application.nativeBuildVersion ?? '—'})
        </Text>
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
    card: {
      backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line,
      padding: spacing.md, marginTop: spacing.sm,
    },
    setLbl: { fontSize: ty.small, fontWeight: '700', color: c.ink2, marginTop: spacing.sm, marginBottom: spacing.xs },
    chipRow: { flexDirection: 'row', gap: spacing.sm },
    chip: {
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill,
      borderWidth: 1, borderColor: c.line, backgroundColor: c.surface,
    },
    chipOn: { borderColor: c.blue, backgroundColor: c.blueLight },
    chipTxt: { fontSize: ty.small, color: c.ink2, fontWeight: '600' },
    chipTxtOn: { color: c.blueDark, fontWeight: '800' },
    credit: { fontSize: ty.tiny, color: c.mute, lineHeight: 16 },
    resetBtn: {
      marginTop: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: c.line,
      paddingVertical: spacing.sm, alignItems: 'center',
    },
    resetBtnArm: { borderColor: c.red, backgroundColor: c.ngBg },
    resetTxt: { fontSize: ty.small, color: c.mute, fontWeight: '700' },
    resetTxtArm: { color: c.red, fontWeight: '800' },
    version: { textAlign: 'center', color: c.faint, fontSize: ty.tiny, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.lg },
  });
