/**
 * jtf-3-1-1 — 句点の打ち方
 *
 * JTFスタイルガイド 3.1.1: 文末には全角句点（。）を使用する。
 * 半角ピリオド（.）を文末句点として使うことを禁じる。
 * 小数点や英字略語に続く場合は除外する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef, JA_CHAR } from "./shared";

export function createJtfKuten(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-3-1-1");
  if (!meta) throw new Error("manifest is missing the jtf-3-1-1 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Detect half-width period used as sentence-ending (followed by Japanese char or end)
      const pattern = new RegExp(`\\.(?=${JA_CHAR}|$)`, "g");
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        // Skip if preceded by digits/alpha (decimal, abbreviation)
        if (m.index > 0 && /[a-zA-Z0-9]/.test(text[m.index - 1])) continue;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Use full-width kuten (。) for sentence endings, not half-width period (.)",
          messageJa:
            "JTFスタイルガイドに基づき、文末には全角句点（。）を使用してください。半角ピリオド（.）は文末の句点として使いません。",
          from: m.index,
          to: m.index + 1,
          originalText: ".",
          reference: jtfRef("3.1.1"),
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
