/**
 * jtf-1-2-1 — 句読点の統一
 *
 * JTFスタイルガイド 1.2.1: 全角カンマ（，）や全角ピリオド（．）を
 * 日本語の句読点として使用することを禁じ、読点（、）・句点（。）への
 * 置換を促す。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfPunctuationStandard(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-1-2-1");
  if (!meta) throw new Error("manifest is missing the jtf-1-2-1 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Detect full-width comma ，used as Japanese punctuation
      const fwComma = /，/g;
      let m: RegExpExecArray | null;
      while ((m = fwComma.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use full-width touten (、) instead of full-width comma (，)",
          messageJa:
            "JTFスタイルガイドに基づき、句読点には全角の読点（、）を使用してください。全角カンマ（，）は使用しません。",
          from: m.index,
          to: m.index + 1,
          originalText: "，",
          reference: jtfRef("1.2.1"),
          fix: { label: "Replace with 、", labelJa: "「、」に置換", replacement: "、" },
        });
      }

      // Detect full-width period ．used as Japanese punctuation
      const fwPeriod = /．/g;
      while ((m = fwPeriod.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use full-width kuten (。) instead of full-width period (．)",
          messageJa:
            "JTFスタイルガイドに基づき、句読点には全角の句点（。）を使用してください。全角ピリオド（．）は使用しません。",
          from: m.index,
          to: m.index + 1,
          originalText: "．",
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
