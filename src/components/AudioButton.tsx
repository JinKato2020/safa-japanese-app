// 音声再生ボタン(expo-av)。詳細画面でのみ lazy 読み込み＝起動経路に載せない。
// 音声がある項目だけ再生/一時停止。無ければ「準備中」。
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { AUDIO } from '../data/audioMap';
import { spacing, radius, type as ty, useColors } from '../theme';
import { useT } from '../i18n';

export default function AudioButton({ id }: { id: string }) {
  const c = useColors();
  const t = useT();
  const source = AUDIO[id];
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => () => { soundRef.current?.unloadAsync().catch(() => {}); soundRef.current = null; }, []);

  if (!source) {
    return (
      <View style={[styles.box, { backgroundColor: c.bgSoft, borderColor: c.line }]}>
        <Text style={styles.icon}>🔊</Text>
        <Text style={[styles.txt, { color: c.mute }]}>{t.audioComingSoon}</Text>
      </View>
    );
  }

  const toggle = async () => {
    try {
      if (soundRef.current) {
        if (playing) await soundRef.current.pauseAsync();
        else await soundRef.current.playAsync();
        return;
      }
      setLoading(true);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return;
        setPlaying(st.isPlaying);
        if (st.didJustFinish) { setPlaying(false); sound.setPositionAsync(0).catch(() => {}); }
      });
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <Pressable onPress={toggle} style={[styles.box, { backgroundColor: playing ? c.blueLight : c.bgSoft, borderColor: playing ? c.blue : c.line }]}>
      <Text style={styles.icon}>{loading ? '⏳' : playing ? '⏸️' : '▶️'}</Text>
      <Text style={[styles.txt, { color: playing ? c.blueDark : c.mute }]}>{playing ? t.audioPlaying : t.audioPlay}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.lg, borderWidth: 1, paddingVertical: spacing.md, marginBottom: spacing.md },
  icon: { fontSize: 22 },
  txt: { fontSize: ty.small, fontWeight: '700' },
});
