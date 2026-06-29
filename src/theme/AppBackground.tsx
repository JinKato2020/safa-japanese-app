// 「桜水彩」アプリ背景 — 和モダンの高級デザイン。
//  ① 和紙のベースグラデ ② 水彩のにじみ(SVGラジアルを重ねる layered washes・ゆっくり呼吸/漂う)
//  ③ 金粉のきらめき(twinkle) ④ notch入りSVGの桜の花びらが少数・ゆったり舞う。
// settings.theme==='sakura' のときだけ表示。ルート最背面に absolute 配置・pointerEvents='none'。
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, LinearGradient as SvgLG, Path, RadialGradient, Stop } from 'react-native-svg';
import { SAKURA_BASE, isGradientTheme } from './theme';
import { useAppTheme } from './useColors';

const { width: W, height: H } = Dimensions.get('window');
type Tri = readonly [string, string, ...string[]];

// 桜の花びら(notch=先端の切れ込みを持つ・narrow base→wide top)。viewBox 0 0 32 36。
const PETAL_PATH =
  'M16 34 C 9 30, 3 22, 5 12 C 6.5 7.5, 11.5 6.5, 14.5 10.5 L 16 12.5 L 17.5 10.5 C 20.5 6.5, 25.5 7.5, 27 12 C 29 22, 23 30, 16 34 Z';

// 水彩のにじみ(layered washes)。色は和の上品なトーン(桜・藤・杏・藍のひそやか)。
const BLOBS = [
  { xf: 0.14, yf: 0.10, r: 210, color: '#f3a9c2', op: 0.55, dx: 26, dy: 16, sc: 0.10, dur: 19000, ph: 0 },
  { xf: 0.88, yf: 0.15, r: 240, color: '#c9b3e6', op: 0.48, dx: -30, dy: 20, sc: 0.12, dur: 23000, ph: 1 }, // 藤
  { xf: 0.74, yf: 0.43, r: 190, color: '#f6cda0', op: 0.34, dx: 22, dy: -16, sc: 0.10, dur: 27000, ph: 2 }, // 杏(温かみ)
  { xf: 0.18, yf: 0.50, r: 225, color: '#ec8fb0', op: 0.50, dx: 28, dy: 18, sc: 0.11, dur: 21000, ph: 1 },
  { xf: 0.58, yf: 0.80, r: 270, color: '#a9bce0', op: 0.34, dx: -24, dy: -18, sc: 0.12, dur: 30000, ph: 0 }, // 藍(奥行き)
  { xf: 0.42, yf: 0.30, r: 160, color: '#ffdbe5', op: 0.55, dx: 16, dy: 14, sc: 0.09, dur: 25000, ph: 2 }, // ハイライト
];

interface BlobC { xf: number; yf: number; r: number; color: string; op: number; dx: number; dy: number; sc: number; dur: number; ph: number }
function Blob({ b, i }: { b: BlobC; i: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: b.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: b.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    const start = Animated.sequence([Animated.delay(b.ph * 2200), loop]);
    start.start();
    return () => start.stop();
  }, [t, b.dur, b.ph]);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, b.dx] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, b.dy] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + b.sc] });
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const size = b.r * 2;
  return (
    <Animated.View
      style={{ position: 'absolute', left: b.xf * W - b.r, top: b.yf * H - b.r, width: size, height: size, opacity, transform: [{ translateX }, { translateY }, { scale }] }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`b${i}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={b.color} stopOpacity={b.op} />
            <Stop offset="55%" stopColor={b.color} stopOpacity={b.op * 0.34} />
            <Stop offset="100%" stopColor={b.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={b.r} cy={b.r} rx={b.r} ry={b.r} fill={`url(#b${i})`} />
      </Svg>
    </Animated.View>
  );
}

interface FleckC { x: number; y: number; size: number; min: number; max: number; dur: number; delay: number; halo: boolean }
function Fleck({ f }: { f: FleckC }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: f.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: f.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    const s = Animated.sequence([Animated.delay(f.delay), loop]);
    s.start();
    return () => s.stop();
  }, [t, f.dur, f.delay]);
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [f.min, f.max] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  return (
    <>
      {f.halo && (
        <Animated.View style={{ position: 'absolute', left: f.x - f.size * 1.6, top: f.y - f.size * 1.6, width: f.size * 4.2, height: f.size * 4.2, borderRadius: f.size * 2.1, backgroundColor: '#e7c879', opacity: opacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }) }} />
      )}
      <Animated.View style={{ position: 'absolute', left: f.x, top: f.y, width: f.size, height: f.size, borderRadius: f.size / 2, backgroundColor: '#d8b15c', opacity, transform: [{ scale }] }} />
    </>
  );
}

// 金箔(きんぱく)フレーク — 角のある不定形ポリゴンに金のグラデ。和モダンの上質感。
interface LeafC { x: number; y: number; size: number; rot: number; min: number; max: number; dur: number; delay: number; pts: string; i: number }
function GoldLeaf({ g }: { g: LeafC }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: g.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: g.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    const s = Animated.sequence([Animated.delay(g.delay), loop]);
    s.start();
    return () => s.stop();
  }, [t, g.dur, g.delay]);
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [g.min, g.max] });
  return (
    <Animated.View style={{ position: 'absolute', left: g.x, top: g.y, width: g.size, height: g.size, opacity, transform: [{ rotate: `${g.rot}deg` }] }}>
      <Svg width={g.size} height={g.size} viewBox="0 0 10 10">
        <Defs>
          <SvgLG id={`g${g.i}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#f7e6a4" />
            <Stop offset="0.5" stopColor="#dcb866" />
            <Stop offset="1" stopColor="#bd9540" />
          </SvgLG>
        </Defs>
        <Path d={g.pts} fill={`url(#g${g.i})`} />
      </Svg>
    </Animated.View>
  );
}

interface PetalC { startX: number; size: number; duration: number; delay: number; sway: number; rot: number; dir: number; maxOp: number; i: number }
function Petal({ p }: { p: PetalC }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const seq = Animated.sequence([
      Animated.delay(p.delay),
      Animated.loop(Animated.timing(t, { toValue: 1, duration: p.duration, easing: Easing.linear, useNativeDriver: true })),
    ]);
    seq.start();
    return () => seq.stop();
  }, [t, p.duration, p.delay]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-44, H + 44] });
  const translateX = t.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [p.startX, p.startX + p.sway, p.startX, p.startX - p.sway, p.startX],
  });
  const rotate = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [`${-p.rot}deg`, `${p.rot * p.dir}deg`, `${-p.rot}deg`],
  });
  const opacity = t.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, p.maxOp, p.maxOp, 0] });
  const w = p.size;
  const h = p.size * 1.12;
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, opacity, transform: [{ translateY }, { translateX }, { rotate }] }}>
      <Svg width={w} height={h} viewBox="0 0 32 36">
        <Defs>
          <SvgLG id={`p${p.i}`} x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0" stopColor="#ffe7ee" />
            <Stop offset="1" stopColor="#f2aac8" />
          </SvgLG>
        </Defs>
        <Path d={PETAL_PATH} fill={`url(#p${p.i})`} stroke="#e892b4" strokeOpacity={0.22} strokeWidth={0.6} />
      </Svg>
    </Animated.View>
  );
}

export default function AppBackground() {
  const theme = useAppTheme();

  const petals = useMemo<PetalC[]>(() => {
    if (!isGradientTheme(theme)) return [];
    const r = (n: number) => Math.random() * n;
    return Array.from({ length: 7 }, (_, i) => {
      const big = i < 2; // 前景の大きめ花びら(やわらかく半透明)で奥行きを出す
      return {
        i,
        startX: r(W),
        size: big ? 34 + r(14) : 15 + r(11),
        duration: big ? 20000 + r(8000) : 14000 + r(8000),
        delay: r(12000),
        sway: 22 + r(40),
        rot: 12 + r(16),
        dir: Math.random() > 0.5 ? 1 : -1,
        maxOp: big ? 0.5 + r(0.12) : 0.85 + r(0.1),
      };
    });
  }, [theme]);

  const flecks = useMemo<FleckC[]>(() => {
    if (!isGradientTheme(theme)) return [];
    const r = (n: number) => Math.random() * n;
    return Array.from({ length: 9 }, () => {
      const size = 1.6 + r(2.2);
      return { x: r(W), y: r(H), size, min: 0.08 + r(0.1), max: 0.4 + r(0.2), dur: 2400 + r(3200), delay: r(4000), halo: size > 3.2 };
    });
  }, [theme]);

  const leaves = useMemo<LeafC[]>(() => {
    if (!isGradientTheme(theme)) return [];
    const r = (n: number) => Math.random() * n;
    const j = () => (Math.random() - 0.5) * 2.4;
    return Array.from({ length: 9 }, (_, i) => ({
      i,
      x: r(W),
      y: r(H),
      size: 6 + r(11),
      rot: r(360),
      min: 0.16 + r(0.12),
      max: 0.5 + r(0.28),
      dur: 2600 + r(3200),
      delay: r(4200),
      pts: `M${1 + j()} ${1.4 + j()} L${9 + j()} ${2 + j()} L${8.4 + j()} ${9 + j()} L${1.4 + j()} ${8.2 + j()} Z`,
    }));
  }, [theme]);

  if (!isGradientTheme(theme)) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={SAKURA_BASE as unknown as Tri} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      {/* 水彩のにじみ(奥) */}
      {BLOBS.map((b, i) => <Blob key={i} b={b} i={i} />)}
      {/* 金粉のきらめき(細) */}
      {flecks.map((f, i) => <Fleck key={i} f={f} />)}
      {/* 金箔フレーク */}
      {leaves.map((g) => <GoldLeaf key={g.i} g={g} />)}
      {/* 舞う桜(少数・ゆったり・前景は大きく半透明) */}
      {petals.map((p) => <Petal key={p.i} p={p} />)}
    </View>
  );
}
