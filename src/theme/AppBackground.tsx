// 「桜水彩」アプリ背景 — Skia(GPU)。
//  ① 流れる水彩シェーダー(色がリッチに移ろう＋中央の温かな光)
//  ② 砂金(さきん) — シェーダーで微細な金の粒が drift＋twinkle。全体量がゆっくり増減し“凪(なし)”の瞬間もある。
//  ③ 桜の花びら — なめらかな形＋奥行きグラデ、自然な舞い(連続回転＋3D反転＋二重ゆらぎ)、前景はぼかし。
// settings.theme==='sakura' のときだけ表示。ルート最背面・操作は透過。Web は非対応のため null。
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
// 砂金: グリッドの一部セルが点光。drift で流れ、twinkle でまたたく。
float dust(float2 uv, float tm, float cell, float thr, float drift){
  float2 p = uv * u_resolution / cell;
  p = p + float2(tm*drift, tm*drift*1.6);
  float2 ip = floor(p); float2 fp = fract(p);
  float h = hash(ip);
  float spark = step(thr, h);
  float tw = max(0.0, 0.4 + 0.6 * sin(tm*5.0 + h*43.0));
  float d = length(fp - float2(0.5,0.5));
  float pt = smoothstep(0.42, 0.0, d);
  return spark * tw * pt;
}
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
  // 砂金(2層・全体量がゆっくり増減＝凪の瞬間あり)
  float env = smoothstep(0.42, 0.92, fbm(uv*0.5 + u_time*0.025));
  float gd = dust(uv, u_time, 6.5, 0.955, 4.0) + dust(uv, u_time, 3.5, 0.975, 7.0) * 0.7;
  gd = gd * env;
  col = mix(col, half3(1.0,0.93,0.62), clamp(gd, 0.0, 1.0) * 0.85);
  col = mix(col, half3(1.0), 0.12);
  return half4(col, 1.0);
}`;

const PETAL_D = 'M0 -14 C8 -10 9 0 5 8 L0 4 L-5 8 C-9 0 -8 -10 0 -14 Z';

interface PetalP { i: number; x: number; scale: number; cycle: number; delay: number; swA: number; swF1: number; swF2: number; drift: number; rotS: number; flipF: number; maxOp: number; blur: number; ph: number }
function Petal({ clock, p, height, path }: { clock: SharedValue<number>; p: PetalP; height: number; path: ReturnType<typeof Skia.Path.MakeFromSVGString> }) {
  const transform = useDerivedValue(() => {
    'worklet';
    const t = clock.value / 1000;
    const k = ((t + p.delay) % p.cycle) / p.cycle;
    const y = -50 + k * (height + 100);
    const x = p.x + Math.sin(t * p.swF1 + p.ph) * p.swA + Math.sin(t * p.swF2 + p.ph * 2) * p.swA * 0.5 + (k - 0.5) * p.drift;
    const rot = t * p.rotS + p.ph;
    const flip = Math.sin(t * p.flipF + p.ph);
    const sx = p.scale * (0.16 + 0.84 * Math.abs(flip));
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
        {petals.map((p) => <Petal key={p.i} clock={clock} p={p} height={height} path={petalPath} />)}
      </Canvas>
    </View>
  );
}
