// 「桜水彩」アプリ背景 — Skia(GPU)。
//  ① 流れる水彩シェーダー(色が移ろう＋中央の温かな光)
//  ② 砂金 = 光る金粒(コア＋グロー)を実体として散らす。drift＋twinkleで“見える”存在感。
//  ③ 桜の花びら = しなやかに漂う(完全エッジ反転を避けゆるく傾く・蛇行ドリフト・ゆるい回転・やわらかいぼかし)。
// settings.theme が sakura/sakura2 のときだけ表示。Webは非対応のため null。
import { useMemo } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BlurMask, Canvas, Fill, Group, LinearGradient, Path, Shader, Skia, vec } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { isGradientTheme } from './theme';
import { useAppTheme } from './useColors';

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
  float dd = distance(uv, float2(0.5,0.42));
  col = col + (0.07 * (1.0 - smoothstep(0.0,0.8,dd)));
  col = mix(col, half3(1.0), 0.12);
  return half4(col, 1.0);
}`;

const PETAL_D = 'M0 -14 C8 -10 9 0 5 8 L0 4 L-5 8 C-9 0 -8 -10 0 -14 Z';

// ---- 桜の花びら(しなやか) ----
interface PetalP { i: number; x: number; scale: number; cycle: number; delay: number; swA: number; swF1: number; swF2: number; drift: number; rotS: number; flipF: number; maxOp: number; blur: number; ph: number }
function Petal({ clock, p, height, path }: { clock: SharedValue<number>; p: PetalP; height: number; path: ReturnType<typeof Skia.Path.MakeFromSVGString> }) {
  const transform = useDerivedValue(() => {
    'worklet';
    const t = clock.value / 1000;
    const k = ((t + p.delay) % p.cycle) / p.cycle;
    const y = -50 + k * (height + 100);
    // 2つのサインを合成した蛇行＋全体の横流れ＝自然なドリフト
    const x = p.x + Math.sin(t * p.swF1 + p.ph) * p.swA + Math.sin(t * p.swF2 + p.ph * 1.7) * p.swA * 0.45 + (k - 0.5) * p.drift;
    const rot = t * p.rotS + p.ph + Math.sin(t * 0.5 + p.ph) * 0.25; // ゆらぎ付きの回転
    const sx = p.scale * (0.62 + 0.38 * Math.abs(Math.sin(t * p.flipF + p.ph))); // 0.62〜1.0=完全エッジ(紙)にしない
    return [{ translateX: x }, { translateY: y }, { rotate: rot }, { scaleX: sx }, { scaleY: p.scale }];
  });
  const opacity = useDerivedValue(() => {
    'worklet';
    const k = ((clock.value / 1000 + p.delay) % p.cycle) / p.cycle;
    const fade = Math.min(k / 0.12, (1 - k) / 0.12);
    return p.maxOp * Math.max(0, Math.min(1, fade));
  });
  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={path!}>
        <LinearGradient start={vec(0, -14)} end={vec(3, 9)} colors={['#fff3f7', '#fbc3d8', '#f3a6c6']} positions={[0, 0.5, 1]} />
        <BlurMask blur={p.blur} style="normal" />
      </Path>
    </Group>
  );
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

  const petalScale = theme === 'sakura2' ? 0.58 : 1;
  const petals = useMemo<PetalP[]>(() => {
    const r = (n: number) => Math.random() * n;
    return Array.from({ length: 9 }, (_, i) => {
      const big = i < 3;
      return {
        i, x: r(width),
        scale: (big ? 1.6 + r(0.7) : 0.85 + r(0.7)) * petalScale,
        cycle: big ? 20 + r(9) : 15 + r(8),
        delay: r(20), swA: 30 + r(50),
        swF1: 0.22 + r(0.28), swF2: 0.5 + r(0.4),
        drift: (Math.random() - 0.5) * 90,
        rotS: (Math.random() > 0.5 ? 1 : -1) * (0.25 + r(0.5)),
        flipF: 0.4 + r(0.6),
        maxOp: big ? 0.6 + r(0.12) : 0.82 + r(0.13),
        blur: big ? 1.6 + r(1.4) : 0.4 + r(0.8),
        ph: r(Math.PI * 2),
      };
    });
  }, [width, petalScale]);

  if (Platform.OS === 'web' || !isGradientTheme(theme) || !effect || !petalPath) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
        {petals.map((p) => <Petal key={p.i} clock={clock} p={p} height={height} path={petalPath} />)}
      </Canvas>
    </View>
  );
}
