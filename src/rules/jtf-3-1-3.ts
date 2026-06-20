/**
 * jtf-3-1-3 — ピリオド・カンマを使わない
 *
 * JTFスタイルガイド 3.1.3: 日本語文中では半角カンマ（,）・半角ピリオド（.）を
 * 句読点として使用しない。全角の読点（、）・句点（。）を使う。
 * 非ASCII文字に前後を囲まれた場合のみ検出する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfPeriodComma(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-3-1-3");
  if (!meta) throw new Error("manifest is missing the jtf-3-1-3 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Detect half-width comma in Japanese context (not between ASCII chars)
      const commaPattern = new RegExp(`(?<=[^\\x00-\\x7E]),(?=[^\\x00-\\x7E])`, "g");
      let m: RegExpExecArray | null;
      while ((m = commaPattern.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use full-width touten (、) in Japanese text, not half-width comma",
          messageJa:
            "JTFスタイルガイドに基づき、日本語文中では半角カンマ（,）ではなく全角読点（、）を使用してください。",
          from: m.index,
          to: m.index + 1,
          originalText: ",",
          reference: jtfRef("3.1.3"),
          fix: { label: "Replace with 、", labelJa: "「、」に置換", replacement: "、" },
        });
      }

      // Detect half-width period in Japanese context
      const periodPattern = new RegExp(`(?<=[^\\x00-\\x7E])\\.(?=[^\\x00-\\x7E])`, "g");
      while ((m = periodPattern.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use full-width kuten (。) in Japanese text, not half-width period",
          messageJa:
            "JTFスタイルガイドに基づき、日本語文中では半角ピリオド（.）ではなく全角句点（。）を使用してください。",
          from: m.index,
          to: m.index + 1,
          originalText: ".",
          reference: jtfRef("3.1.3"),
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
