/**
 * jtf-1-2-1-punctuation — 全角の読点・句点を使う
 *
 * JTFスタイルガイド 1.2.1: 和文中の半角カンマ（,）・半角ピリオド（.）を
 * 全角読点（、）・全角句点（。）へ置換する。
 * 日本語文字に隣接する場合のみ検出し、英数文脈の小数点・省略符号は除外する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef, JA_CHAR } from "./shared";

export function createJtfPunctuationReplacement(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-1-2-1-punctuation");
  if (!meta) throw new Error("manifest is missing the jtf-1-2-1-punctuation rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Half-width comma preceded by a non-ASCII char (Japanese context)
      const commaPattern = new RegExp(`(?<=${JA_CHAR}),|,(?=${JA_CHAR})`, "g");
      let m: RegExpExecArray | null;
      while ((m = commaPattern.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use full-width touten (、) instead of half-width comma (,) in Japanese text",
          messageJa:
            "JTFスタイルガイドに基づき、和文中では半角カンマ（,）ではなく全角読点（、）を使用してください。",
          from: m.index,
          to: m.index + 1,
          originalText: ",",
          reference: jtfRef("1.2.1"),
          fix: { label: "Replace with 、", labelJa: "「、」に置換", replacement: "、" },
        });
      }

      // Half-width period preceded by a non-ASCII char (Japanese context)
      // Exclude decimal points (digit.digit) and abbreviations
      const periodPattern = new RegExp(
        `(?<=${JA_CHAR})\\.(?!\\d)|(?<![a-zA-Z0-9])\\.(?=${JA_CHAR})`,
        "g",
      );
      while ((m = periodPattern.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use full-width kuten (。) instead of half-width period (.) in Japanese text",
          messageJa:
            "JTFスタイルガイドに基づき、和文中では半角ピリオド（.）ではなく全角句点（。）を使用してください。",
          from: m.index,
          to: m.index + 1,
          originalText: ".",
          reference: jtfRef("1.2.1"),
          fix: { label: "Replace with 。", labelJa: "「。」に置換", replacement: "。" },
        });
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
