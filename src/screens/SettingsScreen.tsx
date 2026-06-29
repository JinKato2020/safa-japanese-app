// 設定タブ。テーマ・言語選択・規約類(プライバシー/利用規約/評価)・辞書出典・版表示・初期化。
// 文言は i18n(現在は英語)。様式はまいにちJLPT ProfileScreen と同一。
import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import { spacing, radius, type as ty, useColors, type ThemeColors } from '../theme';
import { useSettings, type ThemeMode } from '../store/settings';
import { useT, LANGUAGES } from '../i18n';
import { DICT_BASE_URL } from '../../safa-shared/JLPT-Listening/dict/dictRemote';

const ANDROID_PACKAGE = 'com.safa.japanese';

// 共有辞書の出典（safa-shared/JLPT-Listening の正本に準拠。帰属表示は必須）。
const DICT_SOURCE = 'JMdict / KANJIDIC2 (EDRDG, CC BY-SA) · Japanese WordNet (NICT) · Examples: Tatoeba / Tanaka Corpus';

export default function SettingsScreen() {
  const { settings, setSettings, reset } = useSettings();
  const t = useT();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const [confirmReset, setConfirmReset] = useState(false);

  // テーマ＝明暗＋背景を一括。自動/標準/桜水彩/ダーク。
  const THEMES: { v: ThemeMode; label: string }[] = [
    { v: 'auto', label: t.themeAuto },
    { v: 'light', label: t.themeDefault },
    { v: 'sakura', label: t.themeSakura },
    { v: 'sakura2', label: t.themeSakura2 },
    { v: 'dark', label: t.themeDark },
  ];

  const openUrl = async (url: string) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert(t.openError, url);
    } catch {
      Alert.alert(t.openError, url);
    }
  };

  const rate = async () => {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        return;
      }
    } catch { /* fall through */ }
    // フォールバック: ストアの該当ページを開く
    const url = Platform.OS === 'android'
      ? `market://details?id=${ANDROID_PACKAGE}`
      : 'itms-apps://apps.apple.com/app/id0';
    openUrl(url);
  };

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.title}>{t.settingsTitle}</Text>

        {/* テーマ(明暗＋背景を統一) */}
        <View style={s.card}>
          <Text style={s.setLbl}>{t.theme}</Text>
          <View style={s.chipRow}>
            {THEMES.map((th) => (
              <Pressable key={th.v} onPress={() => setSettings({ theme: th.v })} style={[s.chip, settings.theme === th.v && s.chipOn]}>
                <Text style={[s.chipTxt, settings.theme === th.v && s.chipTxtOn]}>{th.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* 言語選択 */}
          <Text style={s.setLbl}>{t.language}</Text>
          <View style={s.chipRow}>
            {LANGUAGES.map((lg) => (
              <Pressable key={lg.code} onPress={() => setSettings({ language: lg.code })} style={[s.chip, settings.language === lg.code && s.chipOn]}>
                <Text style={[s.chipTxt, settings.language === lg.code && s.chipTxtOn]}>{lg.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 規約類 */}
        <View style={s.card}>
          <Text style={s.setLbl}>{t.legal}</Text>
          <Pressable style={s.linkRow} onPress={() => openUrl(t.privacyUrl)}>
            <Text style={s.linkTxt}>{t.privacy}</Text><Text style={s.chev}>›</Text>
          </Pressable>
          <View style={s.rowDivider} />
          <Pressable style={s.linkRow} onPress={() => openUrl(t.termsUrl)}>
            <Text style={s.linkTxt}>{t.terms}</Text><Text style={s.chev}>›</Text>
          </Pressable>
          <View style={s.rowDivider} />
          <Pressable style={s.linkRow} onPress={rate}>
            <Text style={s.linkTxt}>{t.rate}</Text><Text style={s.chev}>›</Text>
          </Pressable>
        </View>

        {/* 出典・リセット */}
        <View style={s.card}>
          <Text style={s.setLbl}>{t.dictSourceLabel}</Text>
          <Text style={s.credit}>{DICT_SOURCE}{'\n'}{DICT_BASE_URL}</Text>
          <Pressable
            onPress={() => {
              if (confirmReset) { reset(); setConfirmReset(false); } else { setConfirmReset(true); }
            }}
            style={[s.resetBtn, confirmReset && s.resetBtnArm]}
          >
            <Text style={[s.resetTxt, confirmReset && s.resetTxtArm]}>
              {confirmReset ? t.resetArm : t.resetIdle}
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
    chipRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    chip: {
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill,
      borderWidth: 1, borderColor: c.line, backgroundColor: c.surface,
    },
    chipOn: { borderColor: c.blue, backgroundColor: c.blueLight },
    chipTxt: { fontSize: ty.small, color: c.ink2, fontWeight: '600' },
    chipTxtOn: { color: c.blueDark, fontWeight: '800' },
    linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm + 2 },
    linkTxt: { fontSize: ty.body, color: c.ink, fontWeight: '600' },
    chev: { fontSize: ty.h2, color: c.trace, fontWeight: '700' },
    rowDivider: { height: 1, backgroundColor: c.line },
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
