> # 📌📌 掲示板はこの1ファイルだけ 📌📌
> ## `C:\Users\jwpsa\Documents\desktop\claude\頭脳\掲示板.md`
> **相対パス = `../頭脳/掲示板.md`。「掲示板」と言われたら必ずこれ。**
> ⚠️ `頭脳/販売戦略掲示板.md` は**別物（販売戦略セッション専用）＝掲示板ではない**。混同しない。
> プロンプト実行前にこれを確認し、節目ごとに自分で更新する（既読部分は読み返さない）。

# このフォルダ = safa「日本語アプリ（safa-japanese-app）」専用セッション

**まいにちJLPT の姉妹アプリ。日本語学習の「聴解（リスニング）」を主に担当する。**
本セッションがこのアプリを企画〜実装〜公開まで担う。

## 来歴・現構成（重要）
- **旧**: `../聞いて話せるシリーズ/聞いて話せる日本語`（App A・App C と UI/共通層を共有していた）。
- **転換（2026-06-26 ユーザー決定）**: App A/C から**完全独立**。**新 GitHub リポジトリ `JinKato2020/safa-japanese-app` で作り直し**。
- **UI・汎用辞書は「本アプリ ↔ まいにちJLPT」の2アプリ専用で共有**（A/C は切り離し）。Expo SDK54 / React Native / TypeScript。
- **正本(canonical) = まいにちJLPT**（リポ `JinKato2020/safa-JLPT`、共有デザイン主導＋辞書ビルド所有）。

## 共有基盤（`shared/` = ミラー・直接編集禁止）
- `shared/design/` … `tokens.ts`/`theme.tsx`/`components.tsx`/`useDailyProgress.ts`/`index.ts`（色/トークン/テーマ/汎用部品のみ）。
- `shared/dict/` … `ja-vocab`/`ja-kanji`/`ja-synonyms`/`ja-examples`/`ja-kanji-examples`（汎用日本語辞書。出典 JMdict/KANJIDIC2＝EDRDG、WordNet＝NICT、例文 Tatoeba/田中 → **謝辞画面に帰属表示必須**）。
- 取り込み: `import { DesignThemeProvider } from '../shared/design'`（ルートで `<DesignThemeProvider scheme={scheme}>`）。辞書は `shared/dict/*.json` を読込。詳細＝`shared/design/INTEGRATE.md`。
- ⚠️ **`shared/` は push型ミラー＝直接編集しない**（次回 sync で上書き）。UI/辞書の改善要望は **JLPT セッションへ依頼**。再同期は JLPT 側で `node data-build/sync-ui.mjs` / `node data-build/dict/sync-dict.mjs`（冪等・通信非依存・`manifest.json.version`不変なら最新）。
- 中身（文言・レッスン本文・聴解データ）は**本アプリ固有**。共有は色/トークン/テーマ/汎用部品＋汎用辞書のみ。

## 掲示板ルール（必須・毎回・指示を待たない）
0. **掲示板＝ `../頭脳/掲示板.md`** ＝ **唯一**（全セッション共通の連絡ハブ。本アプリ専用の掲示板は作らない）。
   - ⚠️ `../頭脳/販売戦略掲示板.md` は**別物（販売戦略専用）＝掲示板ではない**。取り違え厳禁。
   - **プロンプト指示を実行する前に `../頭脳/掲示板.md` を確認する**。ただし**前に読んだ所まで来たら、その先は読まない**（既読部分を読み返さない＝トークン節約・厳守）。
   - 書く時は**新しい情報を「連絡ログ」最上部に追記**（新しいものが上）。**「掲示板に書いて」と指示されたら**その内容を連絡ログ最上部に**日付時刻＋セッション名（safa-japanese-app）**付きで追記する。
   - App家族の運用状態=`../聞いて話せるシリーズ/app-state.json`。
1. **節目ごとに自分で `../頭脳/掲示板.md` を更新する**（仕様変更／実装／ビルド／公開／決定／見積もり／承認）。「書いて」と言われなくても書く。

## 役割分担
- **このセッション** = safa-japanese-app（聴解中心）の**企画・実装仕様・実装・ビルド・公開**。
- **共有UI・汎用辞書の正本** = まいにちJLPT（`../JLPTアプリ`）。改善要望はそこへ。
- **収益化・価格・競合・全体戦略の頭脳** = `../頭脳/`。
- **教材コンテンツ生成（翻訳・音声・render）** = `../多言語教材/` へ依頼。直接編集しない。
- **App A/C 本体** = `../聞いて話せるシリーズ/`（本アプリは独立済・コードは別）。

## 費用
- API一括処理（翻訳・TTS・LLM一括生成等）や有料処理で**1000円以上かかるものは、実行前に円換算見積もりを提示して承認を得る**。無断課金しない。

## ビルド・ストア操作（自前で可）
- **`../ビルド・ストア操作_Runbook.md` を参照**。gh CLI はマシン共通で認証済。`JinKato2020/safa-japanese-app` に同型の `ios-build-*.yml` を用意し、`gh workflow run … --repo JinKato2020/safa-japanese-app …` でビルド／`gh run watch/view` で監視。
- 版+1・公開はユーザー合図後・1000円ルールは厳守。
- **ビルドを起動したら起動メッセージのその場で必ず Build番号を表示**（`1000 + git rev-list --count HEAD`）。完了・失敗・キャンセル時も番号を併記。アプリ画面にもバージョン＋Build番号を表示する。

（品質・後始末・サンプルパス提示等の共通方針はグローバル `~/.claude/CLAUDE.md` および `../CLAUDE.md` に従う）
