// 「桜水彩」アプリ背景 — Skia(GPU)・ゴージャス版。
//  ① 流れる水彩シェーダー(色がリッチに移ろう＋金のきらめき＋中央の温かな光)
//  ② 金箔(きんぱく)を多めに — 不定形ポリゴンに金属の照り(動くシーン=シマー)＋ゆるい回転/漂い、大粒は発光。
//  ③ 桜の花びらを刷新 — なめらかな形＋奥行きのグラデ、自然な舞い(連続回転＋3D反転＋二重ゆらぎ)、前景はぼかし。
// settings.theme==='sakura' のときだけ表示。ルート最背面・操作は透過。Web は非対応のため null。
import { useMemo } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BlurMask, Canvas, Fill, Group, LinearGradient, Path, Shader, Skia, vec } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { isGradientTheme } from './theme';
import { useAppTheme } from './useColors';

// リッチな流れる水彩＋金のきらめき＋中央の温かな光
const SKSL = `
uniform float u_time;
uniform float2 u_resolution;
float hash(float2 p){ p = fract(p * float2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
float noise(float2 p){
  float2 i = floor(p); float2 f = fract(p);
  float a = hash(i); float b = hash(i + float2(1.0,0.0));
  float c = hash(i + float2(0.0,1.0)); float d = hash(i + float2(1.0,1.0));
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(float2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.0; a=a*0.5; } return v; }
half4 main(float2 fragCoord){
  float2 uv = fragCoord / u_resolution;
  float t = u_time * 0.05;
  float2 q = uv * 2.4; q = q + float2(t, t*0.7);
  float n1 = fbm(q + fbm(q*1.6 - t));
  float n2 = fbm(q*0.9 + float2(5.2,1.3) + t*0.8);
  half3 cream  = half3(0.988,0.972,0.964);
  half3 sakura = half3(0.964,0.760,0.835);
  half3 plum   = half3(0.815,0.706,0.906);
  half3 rose   = half3(0.945,0.640,0.760);
  half3 indigo = half3(0.726,0.792,0.918);
  half3 col = cream;
  col = mix(col, sakura, smoothstep(0.20,0.82, n1));
  col = mix(col, plum,   smoothstep(0.42,0.95, n2) * 0.75);
  col = mix(col, rose,   smoothstep(0.62,1.05, n1*n2) * 0.45);
  col = mix(col, indigo, smoothstep(0.58,1.02, n2*n2) * 0.35);
  // 中央の温かな光(高級感)
  float d = distance(uv, float2(0.5,0.42));
  col = col + (0.07 * (1.0 - smoothstep(0.0,0.8,d)));
  // 金のきらめき(流れる)
  float g = fbm(uv*7.0 - t*2.2);
  float spark = smoothstep(0.90,1.0, g);
  col = mix(col, half3(0.96,0.84,0.50), spark * 0.6);
  col = mix(col, half3(1.0), 0.12);
  return half4(col, 1.0);
}`;

const GOLD = ['#8a5a16', '#d9a83f', '#fff3c4', '#d9a83f', '#8a5a16'];
const GOLD_POS = [0, 0.35, 0.5, 0.65, 1];
const PETAL_D = 'M0 -14 C8 -10 9 0 5 8 L0 4 L-5 8 C-9 0 -8 -10 0 -14 Z';

// ---- 金箔フレーク ----
interface LeafC { x: number; y: number; size: number; rot0: number; rotS: number; driftA: number; driftF: number; sheenS: number; twF: number; baseOp: number; ph: number; glow: boolean; path: ReturnType<typeof Skia.Path.MakeFromSVGString> }
function GoldLeaf({ clock, g }: { clock: SharedValue<number>; g: LeafC }) {
  const transform = useDerivedValue(() => {
    'worklet';
    const t = clock.value / 1000;
    const rot = g.rot0 + t * g.rotS;
    const dx = Math.sin(t * g.driftF + g.ph) * g.driftA;
    const dy = Math.cos(t * g.driftF * 0.8 + g.ph) * g.driftA * 0.6;
    return [{ translateX: g.x + dx }, { translateY: g.y + dy }, { rotate: rot }];
  });
  const start = useDerivedValue(() => {
    'worklet';
    const a = clock.value / 1000 * g.sheenS + g.ph;
    return vec(Math.cos(a) * g.size, Math.sin(a) * g.size);
  });
  const end = useDerivedValue(() => {
    'worklet';
    const a = clock.value / 1000 * g.sheenS + g.ph;
    return vec(-Math.cos(a) * g.size, -Math.sin(a) * g.size);
  });
  const opacity = useDerivedValue(() => {
    'worklet';
    return g.baseOp * (0.78 + 0.22 * Math.sin(clock.value / 1000 * g.twF + g.ph));
  });
  return (
    <Group transform={transform} opacity={opacity}>
      {g.glow ? (
        <Path path={g.path!} color="#f0d27a" opacity={0.22}>
          <BlurMask blur={9} style="normal" />
        </Path>
      ) : null}
      <Path path={g.path!}>
        <LinearGradient start={start} end={end} colors={GOLD} positions={GOLD_POS} />
      </Path>
    </Group>
  );
}

// ---- 桜の花びら ----
interface PetalP { i: number; x: number; scale: number; cycle: number; delay: number; swA: number; swF1: number; swF2: number; drift: number; rotS: number; flipF: number; maxOp: number; blur: number; ph: number }
function Petal({ clock, p, height, path }: { clock: SharedValue<number>; p: PetalP; height: number; path: ReturnType<typeof Skia.Path.MakeFromSVGString> }) {
  const transform = useDerivedValue(() => {
    'worklet';
    const t = clock.value / 1000;
    const k = ((t + p.delay) % p.cycle) / p.cycle;
    const y = -50 + k * (height + 100);
    const x = p.x + Math.sin(t * p.swF1 + p.ph) * p.swA + Math.sin(t * p.swF2 + p.ph * 2) * p.swA * 0.5 + (k - 0.5) * p.drift;
    const rot = t * p.rotS + p.ph;
    const flip = Math.sin(t * p.flipF + p.ph);        // -1..1
    const sx = p.scale * (0.16 + 0.84 * Math.abs(flip)); // 0付近で“横向き”=3D反転
    return [{ translateX: x }, { translateY: y }, { rotate: rot }, { scaleX: sx }, { scaleY: p.scale }];
  });
  const opacity = useDerivedValue(() => {
    'worklet';
    const k = ((clock.value / 1000 + p.delay) % p.cycle) / p.cycle;
    const fade = Math.min(k / 0.1, (1 - k) / 0.1);
    return p.maxOp * Math.max(0, Math.min(1, fade));
  });
  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={path!}>
        <LinearGradient start={vec(0, -14)} end={vec(3, 9)} colors={['#fff2f6', '#f7b9d2', '#ec97bd']} positions={[0, 0.5, 1]} />
        {p.blur > 0 ? <BlurMask blur={p.blur} style="normal" /> : null}
      </Path>
    </Group>
  );
}

function makeFlakePath(size: number): string {
  const n = 4 + Math.floor(Math.random() * 2); // 4-5 頂点
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
    const r = size * (0.65 + Math.random() * 0.5);
    const x = (Math.cos(a) * r).toFixed(1);
    const y = (Math.sin(a) * r).toFixed(1);
    d += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
  }
  return d + 'Z';
}

export default function AppBackground() {
  const theme = useAppTheme();
  const { width, height } = useWindowDimensions();
  const clock = useSharedValue(0);
  useFrameCallback((f) => {
    'worklet';
    clock.value = f.timeSinceFirstFrame ?? 0;
  });

  const effect = useMemo(() => Skia.RuntimeEffect.Make(SKSL), []);
  const petalPath = useMemo(() => Skia.Path.MakeFromSVGString(PETAL_D), []);
  const uniforms = useDerivedValue(() => ({ u_time: clock.value / 1000, u_resolution: [width, height] }));

  const leaves = useMemo<LeafC[]>(() => {
    const r = (n: number) => Math.random() * n;
    return Array.from({ length: 20 }, () => {
      const size = 5 + r(18);
      return {
        x: r(width), y: r(height), size,
        rot0: r(Math.PI * 2), rotS: (Math.random() > 0.5 ? 1 : -1) * (0.05 + r(0.18)),
        driftA: 6 + r(16), driftF: 0.12 + r(0.22),
        sheenS: 0.8 + r(1.4), twF: 0.4 + r(0.8),
        baseOp: 0.55 + r(0.4), ph: r(Math.PI * 2),
        glow: size > 14, path: Skia.Path.MakeFromSVGString(makeFlakePath(size)),
      };
    });
  }, [width, height]);

  const petals = useMemo<PetalP[]>(() => {
    const r = (n: number) => Math.random() * n;
    return Array.from({ length: 7 }, (_, i) => {
      const big = i < 2;
      return {
        i, x: r(width),
        scale: big ? 1.7 + r(0.7) : 0.8 + r(0.8),
        cycle: big ? 18 + r(8) : 12 + r(7),
        delay: r(16), swA: 16 + r(40),
        swF1: 0.35 + r(0.4), swF2: 0.9 + r(0.7),
        drift: (Math.random() - 0.5) * 130,
        rotS: (Math.random() > 0.5 ? 1 : -1) * (0.5 + r(1.0)),
        flipF: 0.5 + r(0.9),
        maxOp: big ? 0.5 + r(0.12) : 0.85 + r(0.12),
        blur: big ? 1.5 + r(1.5) : 0,
        ph: r(Math.PI * 2),
      };
    });
  }, [width]);

  if (Platform.OS === 'web' || !isGradientTheme(theme) || !effect || !petalPath) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
        {leaves.map((g, i) => (g.path ? <GoldLeaf key={`g${i}`} clock={clock} g={g} /> : null))}
        {petals.map((p) => <Petal key={p.i} clock={clock} p={p} height={height} path={petalPath} />)}
      </Canvas>
    </View>
  );
}
