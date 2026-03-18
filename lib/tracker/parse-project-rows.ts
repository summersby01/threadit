import { parseCrochetRow } from "@/lib/tracker/parse-crochet-row";
import { parseKnittingRow } from "@/lib/tracker/parse-knitting-row";
import type { CraftType, PatternRow, ParseResult } from "@/lib/tracker/types";

export function parseProjectRow(
  craftType: CraftType | null,
  input: string,
): ParseResult {
  if (!craftType) {
    return {
      normalizedTokens: [],
      parsedSteps: [],
      parseError: input.trim() ? "Choose a craft type first" : null,
    };
  }

  if (craftType === "crochet") {
    return parseCrochetRow(input);
  }

  return parseKnittingRow(input);
}

export function parseProjectRows(
  craftType: CraftType | null,
  rows: PatternRow[],
): PatternRow[] {
  return rows.map((row) => {
    const parsed = parseProjectRow(craftType, row.text);

    return {
      ...row,
      parsedSteps: parsed.parsedSteps,
      parseError: parsed.parseError,
    };
  });
}
