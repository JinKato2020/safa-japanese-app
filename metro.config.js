// Metro 設定（標準）。共有UI/辞書 `shared/` はプロジェクトroot配下なので自動で監視・解決される。
// 将来 `shared/` を root外へ移す場合は watchFolders を追加すること。
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
