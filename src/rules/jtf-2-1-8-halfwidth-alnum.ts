/**
 * jtf-2-1-8-halfwidth-alnum — 全角英数字を半角へ統一
 *
 * JTF日本語標準スタイルガイド 2.1.8 は算用数字を、2.1.9 はアルファベットを
 * 半角で表記するよう定める。本ルールは全角英字（Ａ-Ｚ, ａ-ｚ）および全角数字
 * （０-９）を検出し、対応する半角文字への置換を提案する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef, fullwidthToHalfwidth } from "./shared";

export function createJtfHalfwidthAlnum(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-2-1-8-halfwidth-alnum");
  if (!meta) throw new Error("manifest is missing the jtf-2-1-8-halfwidth-alnum rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      const pattern = /[０-９Ａ-Ｚａ-ｚ]/g;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const halfChar = fullwidthToHalfwidth(m[0]);
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Use half-width character instead of full-width: ${m[0]} -> ${halfChar}`,
          messageJa: `JTFスタイルガイドに基づき、全角英数字（${m[0]}）は半角（${halfChar}）で表記してください。`,
          from: m.index,
          to: m.index + 1,
          originalText: m[0],
          reference: jtfRef("2.1.8"),
          fix: {
            label: `Replace with ${halfChar}`,
            labelJa: `「${halfChar}」に置換`,
            replacement: halfChar,
          },
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
