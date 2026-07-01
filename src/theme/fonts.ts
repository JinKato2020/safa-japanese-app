// アプリ全体のフォント = Zen Maru Gothic(丸ゴシック・OFL・商用可)。
// ・useAppFonts() で3ウェイトを同梱ロード。
// ・installGlobalFont() で全 <Text> の fontWeight を対応するファミリーに自動マッピング
//   (Androidは custom font の fontWeight が効かないため、ウェイト別ファミリーで指定する必要がある)。
// ・アイコン等 fontFamily を自前指定している Text は尊重して壊さない。
import { useFonts } from 'expo-font';
import { Text as RNText, StyleSheet } from 'react-native';

export const FONTS = {
  regular: 'ZenMaruGothic-Regular',
  medium: 'ZenMaruGothic-Medium',
  bold: 'ZenMaruGothic-Bold',
} as const;

const WEIGHT_FAMILY: Record<string, string> = {
  '100': FONTS.regular, '200': FONTS.regular, '300': FONTS.regular, '400': FONTS.regular, normal: FONTS.regular,
  '500': FONTS.medium, '600': FONTS.medium,
  '700': FONTS.bold, '800': FONTS.bold, '900': FONTS.bold, bold: FONTS.bold,
};

/** 3ウェイトを同梱ロード。[loaded, error] を返す。 */
export function useAppFonts() {
  return useFonts({
    [FONTS.regular]: require('../../assets/fonts/ZenMaruGothic-Regular.ttf'),
    [FONTS.medium]: require('../../assets/fonts/ZenMaruGothic-Medium.ttf'),
    [FONTS.bold]: require('../../assets/fonts/ZenMaruGothic-Bold.ttf'),
  });
}

let patched = false;
/** 全 <Text> に丸ゴシックを適用(ウェイト→ファミリー変換)。1度だけ実行。 */
export function installGlobalFont() {
  if (patched) return;
  patched = true;
  const anyText = RNText as unknown as { render: (...a: unknown[]) => unknown };
  const orig = anyText.render;
  anyText.render = function (this: unknown, ...args: unknown[]) {
    const props = (args[0] || {}) as { style?: unknown };
    const flat = StyleSheet.flatten(props.style as never) as { fontWeight?: string | number } | undefined;
    const w = flat && flat.fontWeight != null ? String(flat.fontWeight) : '400';
    const fam = WEIGHT_FAMILY[w] || FONTS.regular;
    // 先頭に自前ファミリー → props.style(自前指定のfontFamilyがあれば尊重=アイコン保護) → 末尾でfontWeight解除
    const style = [{ fontFamily: fam }, props.style, { fontWeight: undefined }];
    return orig.call(this, { ...props, style }, ...args.slice(1));
  };
}

// import時に一度だけパッチ(ロード前は端末既定にフォールバック→ロード後に丸ゴシック)。
installGlobalFont();
