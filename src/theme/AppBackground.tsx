// アプリ全体の動的背景。水彩グラデーションがゆっくり移ろい、桜が舞い、淡いボケ玉が漂う。
// settings.theme が sakura/sky/watercolor のときだけ表示。単色テーマ(auto/light/dark)では null。
// ルート(App.tsx)で画面の最背面に absolute 配置。pointerEvents='none' で操作は透過。
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, isGradientTheme, type GradientTheme } from './theme';
import { useAppTheme } from './useColors';

const { width: W, height: H } = Dimensions.get('window');
type Tri = readonly [string, string, ...string[]];

interface PetalProps { color: string; startX: number; size: number; duration: number; delay: number; sway: number; dir: number }
function Petal({ color, startX, size, duration, delay, sway, dir }: PetalProps) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const seq = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.timing(t, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })),
    ]);
    seq.start();
    return () => seq.stop();
  }, [t, duration, delay]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-30, H + 40] });
  const translateX = t.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [startX, startX + sway, startX, startX - sway, startX],
  });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', dir > 0 ? '340deg' : '-340deg'] });
  const opacity = t.interpolate({ inputRange: [0, 0.08, 0.88, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View
      style={[
        styles.petal,
        { width: size, height: size * 1.25, backgroundColor: color, opacity, transform: [{ translateY }, { translateX }, { rotate }] },
      ]}
    />
  );
}

interface OrbProps { color: string; x: number; y: number; size: number; drift: number; dur: number }
function Orb({ color, x, y, size, drift, dur }: OrbProps) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, dur]);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, drift] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -drift * 0.7] });
  return (
    <Animated.View
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ translateX }, { translateY }] }}
    />
  );
}

export default function AppBackground() {
  const theme = useAppTheme();
  const cross = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isGradientTheme(theme)) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cross, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cross, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [theme, cross]);

  const petals = useMemo(() => {
    if (!isGradientTheme(theme)) return [] as PetalProps[];
    const spec = GRADIENTS[theme as GradientTheme];
    const r = (n: number) => Math.random() * n;
    return Array.from({ length: spec.petalCount }, (_, i) => ({
      color: spec.petals[i % spec.petals.length],
      startX: r(W),
      size: 8 + r(9),
      duration: 7000 + r(6000),
      delay: r(9000),
      sway: 18 + r(34),
      dir: Math.random() > 0.5 ? 1 : -1,
    }));
  }, [theme]);

  if (!isGradientTheme(theme)) return null;
  const spec = GRADIENTS[theme as GradientTheme];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={spec.a as unknown as Tri} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: cross }]}>
        <LinearGradient colors={spec.b as unknown as Tri} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {/* 淡いボケ玉(奥行き) */}
      <Orb color={spec.orbs[0]} x={-40} y={H * 0.12} size={220} drift={40} dur={11000} />
      <Orb color={spec.orbs[1]} x={W - 170} y={H * 0.30} size={260} drift={-50} dur={13000} />
      <Orb color={spec.orbs[2]} x={W * 0.28} y={H * 0.62} size={300} drift={36} dur={15000} />
      {/* 舞う花びら */}
      {petals.map((p, i) => <Petal key={i} {...p} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  petal: {
    position: 'absolute',
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
});
