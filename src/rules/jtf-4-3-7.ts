/**
 * jtf-4-3-7 — 周波数の単位（SI）
 *
 * JTF日本語標準スタイルガイド 4.3.7 に基づき、周波数の単位（Hz、kHz、MHz、
 * GHz、THz）の大文字・小文字の誤りを検出し、正しい表記への置換を提案する。
 *
 * 検出対象: 数字の直後に現れる誤った大小表記（hz, HZ, khz, KHz, KHZ, mhz,
 * MHZ, ghz, GHZ, thz, THZ）。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef } from "./shared";

export function createJtfFrequencyUnit(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-4-3-7");
  if (!meta) throw new Error("manifest is missing the jtf-4-3-7 rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      const wrongCases: Array<[RegExp, string]> = [
        [/(?<=\d\s*)hz\b/g, "Hz"],
        [/(?<=\d\s*)HZ\b/g, "Hz"],
        [/(?<=\d\s*)khz\b/gi, "kHz"],
        [/(?<=\d\s*)KHz\b/g, "kHz"],
        [/(?<=\d\s*)KHZ\b/g, "kHz"],
        [/(?<=\d\s*)mhz\b/g, "MHz"],
        [/(?<=\d\s*)MHZ\b/g, "MHz"],
        [/(?<=\d\s*)ghz\b/g, "GHz"],
        [/(?<=\d\s*)GHZ\b/g, "GHz"],
        [/(?<=\d\s*)thz\b/g, "THz"],
        [/(?<=\d\s*)THZ\b/g, "THz"],
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
            reference: jtfRef("4.3.7"),
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
