// 水彩アプリ背景 — Skia(GPU)。流れる水彩シェーダーのみ(花びら・金なし)。
// テーマ(sakura/sora/midori/fuji/akane)ごとにパレットを切り替える。
// settings.theme が水彩テーマのときだけ表示。Web は非対応のため null。
import { useMemo } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { PALETTES, isGradientTheme, type GradientTheme } from './theme';
import { useAppTheme } from './useColors';

// fbmノイズで base に a1/a2/a3 をやわらかく流し込む水彩シェーダー
const SKSL = `
uniform float u_time;
uniform float2 u_resolution;
uniform float3 base;
uniform float3 a1;
uniform float3 a2;
uniform float3 a3;
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
  half3 col = half3(base);
  col = mix(col, half3(a1), smoothstep(0.20,0.82, n1));
  col = mix(col, half3(a2), smoothstep(0.42,0.95, n2) * 0.75);
  col = mix(col, half3(a3), smoothstep(0.60,1.05, n1*n2) * 0.45);
  float dd = distance(uv, float2(0.5,0.42));
  col = col + (0.06 * (1.0 - smoothstep(0.0,0.8,dd)));
  col = mix(col, half3(1.0), 0.10);
  return half4(col, 1.0);
}`;

export default function AppBackground() {
  const theme = useAppTheme();
  const { width, height } = useWindowDimensions();
  const clock = useSharedValue(0);
  useFrameCallback((f) => {
    'worklet';
    clock.value = f.timeSinceFirstFrame ?? 0;
  });

  const effect = useMemo(() => Skia.RuntimeEffect.Make(SKSL), []);
  const pal = PALETTES[(isGradientTheme(theme) ? theme : 'sakura') as GradientTheme];
  const uniforms = useDerivedValue(
    () => ({ u_time: clock.value / 1000, u_resolution: [width, height], base: pal.base, a1: pal.a1, a2: pal.a2, a3: pal.a3 }),
    [pal, width, height],
  );

  if (Platform.OS === 'web' || !isGradientTheme(theme) || !effect) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}
