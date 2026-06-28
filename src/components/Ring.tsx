// 円形プログレスリング(react-native-svg)。カバー率などの 0..1 を弧で表示。
import Svg, { Circle, G } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme';

export interface RingProps {
  ratio: number;        // 0..1
  size?: number;        // 直径(px)
  stroke?: number;      // 線幅
  color?: string;       // 進捗色(省略時 ブランド青)
  trackColor?: string;  // 背景トラック色
  centerTop?: string;   // 中央 上段テキスト(例 "42%")
  centerBottom?: string;// 中央 下段テキスト(例 "N5")
}

export default function Ring({
  ratio, size = 92, stroke = 9, color, trackColor, centerTop, centerBottom,
}: RingProps) {
  const c = useColors();
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, ratio));
  const dash = circ * clamped;
  const prog = color ?? c.blue;
  const track = trackColor ?? c.line;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* 起点を12時に: 全体を-90°回転 */}
        <G rotation={-90} origin={`${cx}, ${cx}`}>
          <Circle cx={cx} cy={cx} r={r} stroke={track} strokeWidth={stroke} fill="none" />
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            stroke={prog}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash}, ${circ}`}
          />
        </G>
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={s.center}>
          {centerTop != null && <Text style={[s.top, { color: c.ink }]}>{centerTop}</Text>}
          {centerBottom != null && <Text style={[s.bottom, { color: c.mute }]}>{centerBottom}</Text>}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  top: { fontSize: 18, fontWeight: '800' },
  bottom: { fontSize: 11, fontWeight: '700', marginTop: 1 },
});
