/**
 * jtf-2-1-10-digit-comma — 数字の桁区切りと小数点の表記
 *
 * JTF日本語標準スタイルガイド 2.1.10 は算用数字の位取りに半角カンマ（,）を、
 * 小数点に半角ピリオド（.）を使うよう定める。
 * 本ルールは数字間の全角カンマ（，）・全角ピリオド（．）を検出し、
 * それぞれ半角記号への置換を提案する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfDigitComma(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-2-1-10-digit-comma");
  if (!meta) throw new Error("manifest is missing the jtf-2-1-10-digit-comma rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Full-width comma in numbers: e.g. 12，345
      const fwCommaInNum = /(\d)，(\d)/g;
      let m: RegExpExecArray | null;
      while ((m = fwCommaInNum.exec(text)) !== null) {
        const from = m.index + 1; // position of ，
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use half-width comma (,) for digit grouping, not full-width (，)",
          messageJa:
            "JTFスタイルガイドに基づき、数字の桁区切りには半角カンマ（,）を使用してください。",
          from,
          to: from + 1,
          originalText: "，",
          reference: jtfRef("2.1.10"),
          fix: { label: "Replace with ,", labelJa: "「,」に置換", replacement: "," },
        });
      }

      // Full-width period in numbers: e.g. 3．14
      const fwPeriodInNum = /(\d)．(\d)/g;
      while ((m = fwPeriodInNum.exec(text)) !== null) {
        const from = m.index + 1;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use half-width period (.) for decimal point, not full-width (．)",
          messageJa: "JTFスタイルガイドに基づき、小数点には半角ピリオド（.）を使用してください。",
          from,
          to: from + 1,
          originalText: "．",
          reference: jtfRef("2.1.10"),
          fix: { label: "Replace with .", labelJa: "「.」に置換", replacement: "." },
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
