# Changelog

## v0.2.0

### Changed

- `jtf-1-2-1-punctuation` の `applicableModes` を `["novel","official","blog","academic","sns"]` に拡張（全モード対応）
- `jtf-2-1-5-fullwidth-kana` の `applicableModes` を `["novel","official","blog","academic","sns"]` に拡張（全モード対応）
- `jtf-3-1-1-kuten-brackets` の `applicableModes` を `["novel","official","blog","academic","sns"]` に拡張（全モード対応）
- `jtf-3-3-brackets-fullwidth` の `applicableModes` を `["novel","official","blog","academic"]` に修正（sns を除外、novel を追加）
- `jtf-4-3-9` の `applicableModes` を `["official","academic"]` に絞り込み（技術文書専用）
- `manifest.json` トップレベルの `"license"` を `"MIT"` から `"CC BY 4.0"` に修正（コンテンツ本体の実態ライセンスに合わせる）

## v0.1.0

- 初版公開。JTF日本語標準スタイルガイド（日本翻訳連盟）に基づく L1 校正ルール 21 件を収録。
  - 句読点（全角統一・閉じかっこ前句点・ピリオド/カンマ不使用）
  - 文字種（半角カタカナ是正・全角英数字の半角化・桁区切り・副詞の漢字表記）
  - スペース／かっこ（半角全角間スペース・かっこ周辺スペース・かっこ全角化）
  - SI 単位（長さ・質量・面積/体積・電気・温度・周波数・速度・伝送速度）
