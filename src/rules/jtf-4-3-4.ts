/**
 * jtf-4-3-4 — 面積・体積の単位（SI）
 *
 * JTF日本語標準スタイルガイド 4.3.4 に基づき、面積・体積の単位（m²、m³、L、mL）の
 * 誤った表記を検出し、正しい表記への置換を提案する。
 *
 * 検出対象:
 *   - 上付き数字なし: m2, m3, cm2, cm3, km2 → m²/m³/cm²/cm³/km²
 *   - 大小誤り: ML → mL, ml → mL, 小文字の l → L（リットル）
 * 偽陽性回避: 数字の直後かつ後続が数字でない場合のみ（m2, cm3 等のみ）。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfAreaVolumeUnit(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-4-3-4");
  if (!meta) throw new Error("manifest is missing the jtf-4-3-4 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Detect "m2", "m3", "cm2", "km2" etc. (missing superscript)
      const superscriptPatterns: Array<[RegExp, string]> = [
        [/(?<=\d\s*)m2(?=[^0-9]|$)/g, "m²"],
        [/(?<=\d\s*)m3(?=[^0-9]|$)/g, "m³"],
        [/(?<=\d\s*)cm2(?=[^0-9]|$)/g, "cm²"],
        [/(?<=\d\s*)cm3(?=[^0-9]|$)/g, "cm³"],
        [/(?<=\d\s*)km2(?=[^0-9]|$)/g, "km²"],
      ];

      for (const [pattern, correct] of superscriptPatterns) {
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(text)) !== null) {
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
            reference: jtfRef("4.3.4"),
            fix: {
              label: `Replace with ${correct}`,
              labelJa: `「${correct}」に置換`,
              replacement: correct,
            },
          });
        }
      }

      // Detect wrong case for L/mL
      const volumePatterns: Array<[RegExp, string]> = [
        [/(?<=\d\s*)ML\b/g, "mL"],
        [/(?<=\d\s*)ml\b/g, "mL"],
        [/(?<=\d\s*)l(?=[^a-zA-Z]|$)/g, "L"], // lowercase l for liter
      ];

      for (const [pattern, correct] of volumePatterns) {
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
            reference: jtfRef("4.3.4"),
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
