/**
 * jtf-4-3-2 — 長さの単位（SI）
 *
 * JTF日本語標準スタイルガイド 4.3.2 に基づき、長さの単位（m、cm、mm、km）の
 * 大文字・小文字の誤りを検出し、正しい表記への置換を提案する。
 *
 * 検出対象: 数字の直後に現れる誤った大小表記（MM, CM, Cm, KM, Km, 単独の M）。
 * 偽陽性回避: 数字に続く場合のみ（lookbehind）、単独の M は後続が英字・スラッシュ・
 * 上付き数字でないことを確認（MHz, m/s, m² などは対象外）。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfLengthUnit(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-4-3-2");
  if (!meta) throw new Error("manifest is missing the jtf-4-3-2 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Wrong case patterns for length units (after digits)
      const wrongCases: Array<[RegExp, string]> = [
        [/(?<=\d\s*)MM\b/g, "mm"],
        [/(?<=\d\s*)CM\b/gi, "cm"],
        [/(?<=\d\s*)Cm\b/g, "cm"],
        [/(?<=\d\s*)KM\b/g, "km"],
        [/(?<=\d\s*)Km\b/g, "km"],
        [/(?<=\d\s*)M(?=[^a-zA-Z/²³]|$)/g, "m"], // Capital M alone (not MHz, etc.)
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
            reference: jtfRef("4.3.2"),
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
