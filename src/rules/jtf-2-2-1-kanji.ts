/**
 * jtf-2-2-1-kanji — 特定副詞などのひらがな表記を漢字表記へ統一
 *
 * JTF日本語標準スタイルガイド 2.2.1 は「必ず」「一切」など特定の副詞・接続詞を
 * 漢字で表記するよう定める。本ルールは HIRAGANA_TO_KANJI リストに基づいて
 * ひらがなのまま書かれた語を検出し、漢字表記への置換を提案する。
 *
 * 偽陽性回避:
 *   - KANJI_EXCLUSION_PATTERNS に登録された複合語（もっともらしい / すべからく）は
 *     スキップする（substring マッチを防ぐ）。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef, HIRAGANA_TO_KANJI, KANJI_EXCLUSION_PATTERNS } from "./shared";

export function createJtfKanji(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-2-2-1-kanji");
  if (!meta) throw new Error("manifest is missing the jtf-2-2-1-kanji rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      for (const [hiragana, kanji] of HIRAGANA_TO_KANJI) {
        const pattern = new RegExp(hiragana, "g");
        const exclusion = KANJI_EXCLUSION_PATTERNS.get(hiragana);
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(text)) !== null) {
          // Skip if this match is part of a known compound word
          if (exclusion) {
            const slice = text.slice(m.index);
            if (exclusion.test(slice)) continue;
          }
          issues.push({
            ruleId: this.id,
            severity: config.severity,
            message: `Use kanji form: ${hiragana} -> ${kanji}`,
            messageJa: `JTFスタイルガイドに基づき、「${hiragana}」は漢字表記「${kanji}」を使用してください。`,
            from: m.index,
            to: m.index + hiragana.length,
            originalText: hiragana,
            reference: jtfRef("2.2.1"),
            fix: {
              label: `Replace with ${kanji}`,
              labelJa: `「${kanji}」に置換`,
              replacement: kanji,
            },
          });
        }
      }

      return issues;
    }
  }

  return new Rule(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
