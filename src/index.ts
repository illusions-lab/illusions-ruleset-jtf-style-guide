/**
 * Ruleset entry point. Builds the single default-exported RulesetModule.
 *
 * - `manifest` is plain data loaded from manifest.json (read without running code).
 * - `createRules(ctx)` builds the concrete rules using SDK tools from `ctx`.
 *
 * Only `import type` from "illusions-lint-sdk"; runtime tools come via `ctx`.
 */
import type { RulesetContext, RulesetModule } from "illusions-lint-sdk";

import manifestJson from "../manifest.json";

import { createJtfPunctuationStandard } from "./rules/jtf-1-2-1";
import { createJtfPunctuationReplacement } from "./rules/jtf-1-2-1-punctuation";
import { createJtfKuten } from "./rules/jtf-3-1-1";
import { createJtfKutenBrackets } from "./rules/jtf-3-1-1-kuten-brackets";
import { createJtfPeriodComma } from "./rules/jtf-3-1-3";
import { createJtfFullwidthKana } from "./rules/jtf-2-1-5-fullwidth-kana";
import { createJtfNumericStandard } from "./rules/jtf-2-1-8";
import { createJtfHalfwidthAlnum } from "./rules/jtf-2-1-8-halfwidth-alnum";
import { createJtfDigitComma } from "./rules/jtf-2-1-10-digit-comma";
import { createJtfKanji } from "./rules/jtf-2-2-1-kanji";
import { createJtfNoSpace } from "./rules/jtf-2-3-no-space";
import { createJtfParenthesesSpace } from "./rules/jtf-3-3-1-parentheses-space";
import { createJtfBracketsFullwidth } from "./rules/jtf-3-3-brackets-fullwidth";
import { createJtfLengthUnit } from "./rules/jtf-4-3-2";
import { createJtfMassUnit } from "./rules/jtf-4-3-3";
import { createJtfAreaVolumeUnit } from "./rules/jtf-4-3-4";
import { createJtfElectricalUnit } from "./rules/jtf-4-3-5";
import { createJtfTemperatureUnit } from "./rules/jtf-4-3-6";
import { createJtfFrequencyUnit } from "./rules/jtf-4-3-7";
import { createJtfSpeedUnit } from "./rules/jtf-4-3-8";
import { createJtfDataRateUnit } from "./rules/jtf-4-3-9";

const manifest = manifestJson as RulesetModule["manifest"];

const ruleset: RulesetModule = {
  manifest,
  createRules(ctx: RulesetContext) {
    return [
      createJtfPunctuationStandard(ctx, manifest),
      createJtfPunctuationReplacement(ctx, manifest),
      createJtfKuten(ctx, manifest),
      createJtfKutenBrackets(ctx, manifest),
      createJtfPeriodComma(ctx, manifest),
      createJtfFullwidthKana(ctx, manifest),
      createJtfNumericStandard(ctx, manifest),
      createJtfHalfwidthAlnum(ctx, manifest),
      createJtfDigitComma(ctx, manifest),
      createJtfKanji(ctx, manifest),
      createJtfNoSpace(ctx, manifest),
      createJtfParenthesesSpace(ctx, manifest),
      createJtfBracketsFullwidth(ctx, manifest),
      createJtfLengthUnit(ctx, manifest),
      createJtfMassUnit(ctx, manifest),
      createJtfAreaVolumeUnit(ctx, manifest),
      createJtfElectricalUnit(ctx, manifest),
      createJtfTemperatureUnit(ctx, manifest),
      createJtfFrequencyUnit(ctx, manifest),
      createJtfSpeedUnit(ctx, manifest),
      createJtfDataRateUnit(ctx, manifest),
    ];
  },
};

export default ruleset;
