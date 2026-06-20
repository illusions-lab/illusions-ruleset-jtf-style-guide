/**
 * jtf-4-3-3 — 質量の単位（SI）
 *
 * JTF日本語標準スタイルガイド 4.3.3 に基づき、質量の単位（g、kg）の
 * 大文字・小文字の誤りを検出し、正しい表記への置換を提案する。
 *
 * 検出対象: 数字の直後に現れる誤った大小表記（KG, Kg, MG, Mg, 単独の G, Gr）。
 * 偽陽性回避: 数字に続く場合のみ（lookbehind）、単独の G は後続が英字でないことを確認。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfMassUnit(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-4-3-3");
  if (!meta) throw new Error("manifest is missing the jtf-4-3-3 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      const wrongCases: Array<[RegExp, string]> = [
        [/(?<=\d\s*)KG\b/g, "kg"],
        [/(?<=\d\s*)Kg\b/g, "kg"],
        [/(?<=\d\s*)MG\b/g, "mg"],
        [/(?<=\d\s*)Mg\b/g, "mg"],
        [/(?<=\d\s*)G(?=[^a-zA-Z]|$)/g, "g"], // Capital G alone
        [/(?<=\d\s*)Gr\b/gi, "g"],
      ];

      for (const [pattern, correct] of wrongCases) {
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(text)) !== null) {
          if (m[0] === correct) continue;
          const matched = m[0];
          const from = m.index;
          issues.push({
            ruleId: this.id,
            severity: config.severity,
            message: `Incorrect unit notation: ${matched} -> ${correct}`,
            messageJa: `JTFスタイルガイドに基づき、単位表記「${matched}」は「${correct}」と表記してください。`,
            from,
            to: from + matched.length,
            originalText: matched,
            reference: jtfRef("4.3.3"),
            fix: {
              label: `Replace with ${correct}`,
              labelJa: `「${correct}」に置換`,
              replacement: correct,
            },
          });
        }
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
