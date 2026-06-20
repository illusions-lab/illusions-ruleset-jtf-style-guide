/**
 * jtf-2-3-no-space — 半角文字と全角文字の間のスペース
 *
 * JTFスタイルガイド 2.3: 半角文字と全角文字の間に半角スペースを入れない。
 * 二方向（半角→全角、全角→半角）を個別の regex パスで検出する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef, JA_CHAR } from "./shared";

export function createJtfNoSpace(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-2-3-no-space");
  if (!meta) throw new Error("manifest is missing the jtf-2-3-no-space rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Space between half-width and full-width chars (both directions)
      const pattern1 = new RegExp(`([a-zA-Z0-9]) (?=${JA_CHAR})`, "g");
      const pattern2 = new RegExp(`(?<=${JA_CHAR}) ([a-zA-Z0-9])`, "g");

      let m: RegExpExecArray | null;
      while ((m = pattern1.exec(text)) !== null) {
        const spaceIdx = m.index + 1;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Remove space between half-width and full-width characters",
          messageJa:
            "JTFスタイルガイドに基づき、半角文字と全角文字の間にスペースを入れないでください。",
          from: spaceIdx,
          to: spaceIdx + 1,
          originalText: " ",
          reference: jtfRef("2.3"),
          fix: { label: "Remove space", labelJa: "スペースを削除", replacement: "" },
        });
      }

      while ((m = pattern2.exec(text)) !== null) {
        // The space is at match position (before the captured group)
        const spaceIdx = m.index;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: "Remove space between full-width and half-width characters",
          messageJa:
            "JTFスタイルガイドに基づき、全角文字と半角文字の間にスペースを入れないでください。",
          from: spaceIdx,
          to: spaceIdx + 1,
          originalText: " ",
          reference: jtfRef("2.3"),
          fix: { label: "Remove space", labelJa: "スペースを削除", replacement: "" },
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
