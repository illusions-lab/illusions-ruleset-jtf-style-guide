/**
 * jtf-3-3-brackets-fullwidth — かっこは全角で表記
 *
 * JTFスタイルガイド 3.3: 丸かっこ（）、大かっこ［］、かぎかっこ「」などは
 * 原則として全角で表記する。日本語文字（漢字・ひらがな・カタカナ）に隣接する
 * 半角かっこ・半角かぎかっこを検出し、対応する全角文字への置換を提案する。
 */
import type { LintIssue, LintRule, LintRuleConfig, RulesetContext, RulesetManifest } from "illusions-lint-sdk";
import { jtfRef, JA_CHAR, HALF_TO_FULL_BRACKET } from "./shared";

export function createJtfBracketsFullwidth(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "jtf-3-3-brackets-fullwidth");
  if (!meta) throw new Error("manifest is missing the jtf-3-3-brackets-fullwidth rule");
  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class Rule extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Half-width brackets adjacent to Japanese characters
      const pattern = new RegExp(`(?<=${JA_CHAR})[()\\[\\]｢｣]|[()\\[\\]｢｣](?=${JA_CHAR})`, "g");
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const halfBracket = m[0];
        const fullBracket = HALF_TO_FULL_BRACKET.get(halfBracket) ?? halfBracket;
        if (fullBracket === halfBracket) continue; // no mapping found
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Use full-width bracket instead of half-width: ${halfBracket} -> ${fullBracket}`,
          messageJa: `JTFスタイルガイドに基づき、半角かっこ（${halfBracket}）は全角（${fullBracket}）で表記してください。`,
          from: m.index,
          to: m.index + 1,
          originalText: halfBracket,
          reference: jtfRef("3.3"),
          fix: {
            label: `Replace with ${fullBracket}`,
            labelJa: `「${fullBracket}」に置換`,
            replacement: fullBracket,
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
