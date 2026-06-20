/**
 * jtf-4-3-5 — 電気の単位（SI）
 *
 * JTF日本語標準スタイルガイド 4.3.5 に基づき、電気の単位（V、A、W、kW、mW、mV、mA）の
 * 大文字・小文字の誤りを検出し、正しい表記への置換を提案する。
 *
 * 検出対象: 数字の直後に現れる誤った大小表記
 *   （小文字 v/w/a、kw/KW、mw、mv、ma）。
 * 偽陽性回避: 数字に続く場合のみ（lookbehind）、後続に英字が続かないことを lookahead で確認。
 * 注意: MW（メガワット）は大文字で正当なため、MW→MW の no-op エントリは省略する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfElectricalUnit(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-4-3-5");
  if (!meta) throw new Error("manifest is missing the jtf-4-3-5 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      const wrongCases: Array<[RegExp, string]> = [
        [/(?<=\d\s*)v(?=[^a-zA-Z]|$)/g, "V"],
        [/(?<=\d\s*)w(?=[^a-zA-Z]|$)/g, "W"],
        [/(?<=\d\s*)a(?=[^a-zA-Z]|$)/g, "A"],
        [/(?<=\d\s*)kw\b/gi, "kW"],
        [/(?<=\d\s*)KW\b/g, "kW"],
        [/(?<=\d\s*)mw\b/g, "mW"],
        // MW→MW is a no-op (m[0] === correct always); omitted per source intent
        [/(?<=\d\s*)mv\b/g, "mV"],
        [/(?<=\d\s*)ma\b/g, "mA"],
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
            reference: jtfRef("4.3.5"),
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
