// 音声再生ボタン。詳細画面でのみ遅延読み込み(lazy)される＝起動経路に expo-audio/audioMap を載せない。
// 音声がある項目だけ再生ボタン、無ければ「準備中」。
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AUDIO } from '../data/audioMap';
import { spacing, radius, type as ty, useColors } from '../theme';
import { useT } from '../i18n';

export default function AudioButton({ id }: { id: string }) {
  const c = useColors();
  const t = useT();
  const source = AUDIO[id];
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);
  const playing = !!status?.playing;

  if (!source) {
    return (
      <View style={[styles.box, { backgroundColor: c.bgSoft, borderColor: c.line }]}>
        <Text style={styles.icon}>🔊</Text>
        <Text style={[styles.txt, { color: c.mute }]}>{t.audioComingSoon}</Text>
      </View>
    );
  }
  const toggle = () => {
    if (playing) { player.pause(); return; }
    if ((status?.currentTime ?? 0) >= (status?.duration ?? 0) - 0.15) player.seekTo(0);
    player.play();
  };
  return (
    <Pressable onPress={toggle} style={[styles.box, { backgroundColor: playing ? c.blueLight : c.bgSoft, borderColor: playing ? c.blue : c.line }]}>
      <Text style={styles.icon}>{playing ? '⏸️' : '▶️'}</Text>
      <Text style={[styles.txt, { color: playing ? c.blueDark : c.mute }]}>{playing ? t.audioPlaying : t.audioPlay}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderRadius: radius.lg, borderWidth: 1, paddingVertical: spacing.md, marginBottom: spacing.md,
  },
  icon: { fontSize: 22 },
  txt: { fontSize: ty.small, fontWeight: '700' },
});
