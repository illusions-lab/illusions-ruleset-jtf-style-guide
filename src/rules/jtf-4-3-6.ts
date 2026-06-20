/**
 * jtf-4-3-6 — 温度の単位（℃）
 *
 * JTF日本語標準スタイルガイド 4.3.6 に基づき、温度の単位として
 * 「°C」（度記号 U+00B0 + 大文字 C）を検出し、正しい「℃」（U+2103）
 * への置換を提案する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfTemperatureUnit(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-4-3-6");
  if (!meta) throw new Error("manifest is missing the jtf-4-3-6 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Detect °C (degree sign + C) which should be ℃ (U+2103)
      const pattern = /°C/g;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use ℃ (U+2103) instead of °C (degree sign + C)",
          messageJa:
            "JTFスタイルガイドに基づき、温度の単位には「℃」（U+2103）を使用してください。「°C」（度記号＋C）は使いません。",
          from: m.index,
          to: m.index + 2,
          originalText: "°C",
          reference: jtfRef("4.3.6"),
          fix: { label: "Replace with ℃", labelJa: "「℃」に置換", replacement: "℃" },
        });
      }

      return issues;
    }
  }

  return new Rule(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId, name: meta.nameJa, nameJa: meta.nameJa,
    description: meta.descriptionJa, descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
