/**
 * jtf-3-1-1-kuten-brackets — 閉じかっこ前の句点
 *
 * JTFスタイルガイド 3.1.1: 文中にかぎかっこや丸かっこが入る場合は、
 * 閉じかっこの前に句点（。）を打たない。
 * 「。」→ 削除（。」 や 。）の形を検出する）。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfKutenBrackets(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-3-1-1-kuten-brackets");
  if (!meta) throw new Error("manifest is missing the jtf-3-1-1-kuten-brackets rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // 。」→ 」 and 。）→ ）
      const pattern = /。(?=[」）\)])/g;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Remove period before closing bracket",
          messageJa: "JTFスタイルガイドに基づき、閉じかっこの前に句点（。）を打たないでください。",
          from: m.index,
          to: m.index + 1,
          originalText: "。",
          reference: jtfRef("3.1.1"),
          fix: { label: "Remove 。", labelJa: "「。」を削除", replacement: "" },
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
