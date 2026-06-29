// 「桜水彩」アプリ背景 — Skia(GPU)版。
//  ① 流れる水彩をフラグメントシェーダーで描画(色が生きて移ろう)
//  ② 桜の花びらが自然に舞う(連続回転＋3D反転=scaleX＋ゆらぎ＋ドリフト・個体差)
//  ③ やわらかな金の光(ボケ)がほのかに明滅。
// settings.theme==='sakura' のときだけ表示。ルート最背面・操作は透過。Web は非対応のため null。
import { useMemo } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BlurMask, Canvas, Circle, Fill, Group, LinearGradient, Path, Shader, Skia, vec } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { isGradientTheme } from './theme';
import { useAppTheme } from './useColors';

// 流れる水彩(fbmノイズで桜・藤・藍・金をやわらかく混ぜる)
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
  float t = u_time * 0.03;
  float2 q = uv * 2.2; q = q + float2(t, t*0.6);
  float n1 = fbm(q + fbm(q*1.5 - t));
  float n2 = fbm(q*0.8 + float2(5.2,1.3) + t*0.7);
  half3 cream  = half3(0.984,0.965,0.957);
  half3 sakura = half3(0.965,0.792,0.851);
  half3 plum   = half3(0.835,0.741,0.906);
  half3 indigo = half3(0.745,0.804,0.918);
  half3 col = cream;
  col = mix(col, sakura, smoothstep(0.25,0.85, n1));
  col = mix(col, plum,   smoothstep(0.45,0.95, n2) * 0.7);
  col = mix(col, indigo, smoothstep(0.55,1.0, n1*n2) * 0.5);
  col = col + (1.0 - uv.y) * 0.04;
  float g = fbm(uv*8.0 - t*2.0);
  float spark = smoothstep(0.93,1.0, g);
  col = mix(col, half3(0.93,0.80,0.45), spark * 0.45);
  col = mix(col, half3(1.0), 0.16);
  return half4(col, 1.0);
}`;

// 中心(0,0)の桜の花びら(先端の切れ込み付き)
const PETAL_D = 'M 0 -13 C 8 -8 9 2 5 9 L 0 5 L -5 9 C -9 2 -8 -8 0 -13 Z';

interface PetalP { i: number; x: number; scale: number; cycle: number; delay: number; swayA: number; swayF: number; drift: number; rotS: number; flipF: number; maxOp: number }

function Petal({ clock, p, height, path }: { clock: SharedValue<number>; p: PetalP; height: number; path: ReturnType<typeof Skia.Path.MakeFromSVGString> }) {
  const transform = useDerivedValue(() => {
    'worklet';
    const t = clock.value / 1000;
    const k = ((t + p.delay) % p.cycle) / p.cycle; // 0..1(落下進行)
    const y = -60 + k * (height + 120);
    const x = p.x + Math.sin(t * p.swayF + p.i) * p.swayA + (k - 0.5) * p.drift;
    const rot = t * p.rotS + p.i;                       // 連続回転(tumble)
    const flip = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(t * p.flipF + p.i)); // 3D反転(scaleX)
    return [{ translateX: x }, { translateY: y }, { rotate: rot }, { scaleX: p.scale * flip }, { scaleY: p.scale }];
  });
  const opacity = useDerivedValue(() => {
    'worklet';
    const t = clock.value / 1000;
    const k = ((t + p.delay) % p.cycle) / p.cycle;
    const fade = Math.min(k / 0.12, (1 - k) / 0.12);
    return p.maxOp * Math.max(0, Math.min(1, fade));
  });
  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={path!}>
        <LinearGradient start={vec(0, -13)} end={vec(2, 9)} colors={['#ffe9ef', '#f4a9c9']} />
      </Path>
    </Group>
  );
}

interface BokehP { x: number; y: number; r: number; blur: number; color: string; f: number; min: number; max: number; ph: number }
function Bokeh({ clock, b }: { clock: SharedValue<number>; b: BokehP }) {
  const opacity = useDerivedValue(() => {
    'worklet';
    const t = clock.value / 1000;
    return b.min + (b.max - b.min) * (0.5 + 0.5 * Math.sin(t * b.f + b.ph));
  });
  const cx = useDerivedValue(() => {
    'worklet';
    return b.x + Math.sin(clock.value / 1000 * b.f * 0.6 + b.ph) * 16;
  });
  return (
    <Group opacity={opacity}>
      <Circle cx={cx} cy={b.y} r={b.r} color={b.color}>
        <BlurMask blur={b.blur} style="normal" />
      </Circle>
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
  const path = useMemo(() => Skia.Path.MakeFromSVGString(PETAL_D), []);
  const uniforms = useDerivedValue(() => ({ u_time: clock.value / 1000, u_resolution: [width, height] }));

  const petals = useMemo<PetalP[]>(() => {
    const r = (n: number) => Math.random() * n;
    return Array.from({ length: 9 }, (_, i) => {
      const big = i < 2;
      return {
        i,
        x: r(width),
        scale: big ? 1.5 + r(0.6) : 0.7 + r(0.7),
        cycle: big ? 16 + r(8) : 11 + r(7),
        delay: r(14),
        swayA: 18 + r(40),
        swayF: 0.4 + r(0.5),
        drift: (Math.random() - 0.5) * 120,
        rotS: (Math.random() > 0.5 ? 1 : -1) * (0.5 + r(0.9)),
        flipF: 0.6 + r(0.9),
        maxOp: big ? 0.55 + r(0.12) : 0.82 + r(0.12),
      };
    });
  }, [width]);

  const bokeh = useMemo<BokehP[]>(() => {
    const r = (n: number) => Math.random() * n;
    const cols = ['rgba(255,228,178,0.9)', 'rgba(255,255,255,0.9)', 'rgba(244,196,214,0.9)'];
    return Array.from({ length: 4 }, (_, i) => ({
      x: r(width), y: r(height), r: 26 + r(40), blur: 30 + r(30),
      color: cols[i % cols.length], f: 0.25 + r(0.3), min: 0.05 + r(0.06), max: 0.18 + r(0.14), ph: r(6),
    }));
  }, [width, height]);

  if (Platform.OS === 'web' || !isGradientTheme(theme) || !effect || !path) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
        {bokeh.map((b, i) => <Bokeh key={`b${i}`} clock={clock} b={b} />)}
        {petals.map((p) => <Petal key={p.i} clock={clock} p={p} height={height} path={path} />)}
      </Canvas>
    </View>
  );
}
