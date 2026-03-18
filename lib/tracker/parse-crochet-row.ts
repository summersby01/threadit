import type { ParseResult } from "@/lib/tracker/types";

const CROCHET_DELIMITER_PATTERN = /^[\s,]+/;
const CROCHET_CONTEXT_PATTERN = /^(MR|MAGIC RING|RING)\b/;
const CROCHET_STITCH_PATTERN = "(?:HDC|SLST|INC|DEC|SC|DC|TR|CH|MR)";
const CROCHET_STITCH_START_PATTERN = /(?:HDC|SLST|INC|DEC|SC|DC|TR|CH|MR|\d)/;

function normalizeCrochetSequence(sequence: string): string {
  return sequence
    .trim()
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function buildParseError(prefix: string, invalidFragments: string[]): string {
  if (invalidFragments.length === 0) {
    return prefix;
  }

  return `${prefix}: ${invalidFragments.join(", ")}`;
}

function consumeInvalidFragment(sequence: string): [string, string] {
  const nextTokenIndex = sequence.slice(1).search(CROCHET_STITCH_START_PATTERN);

  if (nextTokenIndex === -1) {
    return [sequence, ""];
  }

  const endIndex = nextTokenIndex + 1;

  return [sequence.slice(0, endIndex), sequence.slice(endIndex)];
}

function expandCrochetToken(stitch: string, count: number): string[] {
  return Array.from({ length: count }, () => stitch);
}

function parseCrochetSequence(sequence: string): ParseResult {
  const trimmed = normalizeCrochetSequence(sequence);

  if (!trimmed) {
    return {
      normalizedTokens: [],
      parsedSteps: [],
      parseError: null,
    };
  }

  const normalizedTokens: string[] = [];
  const parsedSteps: string[] = [];
  const invalidFragments: string[] = [];
  let remainder = trimmed;

  while (remainder.length > 0) {
    const delimiterMatch = remainder.match(CROCHET_DELIMITER_PATTERN);

    if (delimiterMatch) {
      remainder = remainder.slice(delimiterMatch[0].length);
      continue;
    }

    const contextMatch = remainder.match(
      new RegExp(
        `^(${CROCHET_STITCH_PATTERN})\\s*(\\d+)\\s+(?:IN\\s+)?(MR|MAGIC RING|RING)(?=$|[\\s,]|${CROCHET_STITCH_PATTERN}|\\d)`,
      ),
    );

    if (contextMatch) {
      const stitch = contextMatch[1];
      const count = Number.parseInt(contextMatch[2], 10);
      const context = contextMatch[3] === "MAGIC RING" ? "MR" : contextMatch[3];

      normalizedTokens.push(`${stitch}${count} IN ${context}`);
      parsedSteps.push(...expandCrochetToken(stitch, count));
      remainder = remainder.slice(contextMatch[0].length);
      continue;
    }

    const eachStitchMatch = remainder.match(
      new RegExp(`^(\\d+)\\s*(${CROCHET_STITCH_PATTERN})\\s+IN\\s+EACH\\s+STITCH\\b`),
    );

    if (eachStitchMatch) {
      const count = Number.parseInt(eachStitchMatch[1], 10);
      const stitch = eachStitchMatch[2];

      normalizedTokens.push(`${stitch}${count} IN EACH STITCH`);
      parsedSteps.push(...expandCrochetToken(stitch, count));
      remainder = remainder.slice(eachStitchMatch[0].length);
      continue;
    }

    const repeatedMatch = remainder.match(
      new RegExp(`^(${CROCHET_STITCH_PATTERN})\\s*X\\s*(\\d+)`),
    );

    if (repeatedMatch) {
      const stitch = repeatedMatch[1];
      const count = Number.parseInt(repeatedMatch[2], 10);

      normalizedTokens.push(`${stitch} x${count}`);
      parsedSteps.push(...expandCrochetToken(stitch, count));
      remainder = remainder.slice(repeatedMatch[0].length);
      continue;
    }

    const countedMatch = remainder.match(
      new RegExp(`^(${CROCHET_STITCH_PATTERN})\\s*(\\d+)`),
    );

    if (countedMatch) {
      const stitch = countedMatch[1];
      const count = Number.parseInt(countedMatch[2], 10);

      normalizedTokens.push(`${stitch}${count}`);
      parsedSteps.push(...expandCrochetToken(stitch, count));
      remainder = remainder.slice(countedMatch[0].length);
      continue;
    }

    const countFirstMatch = remainder.match(
      new RegExp(`^(\\d+)\\s*(${CROCHET_STITCH_PATTERN})`),
    );

    if (countFirstMatch) {
      const count = Number.parseInt(countFirstMatch[1], 10);
      const stitch = countFirstMatch[2];

      normalizedTokens.push(`${stitch}${count}`);
      parsedSteps.push(...expandCrochetToken(stitch, count));
      remainder = remainder.slice(countFirstMatch[0].length);
      continue;
    }

    const bareMatch = remainder.match(new RegExp(`^(${CROCHET_STITCH_PATTERN})`));

    if (bareMatch) {
      const stitch = bareMatch[1];

      if (!CROCHET_CONTEXT_PATTERN.test(remainder)) {
        normalizedTokens.push(stitch);
        parsedSteps.push(stitch);
      }

      remainder = remainder.slice(bareMatch[0].length);
      continue;
    }

    const [invalidFragment, nextRemainder] = consumeInvalidFragment(remainder);
    const normalizedFragment = invalidFragment.trim().replace(/,+$/g, "");

    if (normalizedFragment) {
      invalidFragments.push(normalizedFragment);
    }

    remainder = nextRemainder;
  }

  return {
    normalizedTokens,
    parsedSteps,
    parseError:
      parsedSteps.length === 0 && invalidFragments.length > 0
        ? buildParseError("Could not parse crochet instructions", invalidFragments)
        : invalidFragments.length > 0
          ? buildParseError("Ignored unrecognized crochet fragment", invalidFragments)
          : null,
  };
}

export function parseCrochetRow(input: string): ParseResult {
  const trimmed = normalizeCrochetSequence(input);

  if (!trimmed) {
    return { normalizedTokens: [], parsedSteps: [], parseError: null };
  }

  const groupedRepeatMatch = trimmed.match(
    /^(?:\((.+)\)|\*(.+)\*)\s*\*?\s*(?:(?:REPEAT|반복|X)\s*)?(\d+)$/i,
  );

  if (groupedRepeatMatch) {
    const body = groupedRepeatMatch[1] ?? groupedRepeatMatch[2] ?? "";
    const repeatCount = Number.parseInt(groupedRepeatMatch[3], 10);
    const parsed = parseCrochetSequence(body);

    if (parsed.parsedSteps.length === 0 || Number.isNaN(repeatCount) || repeatCount < 1) {
      return {
        normalizedTokens: [],
        parsedSteps: [],
        parseError: parsed.parseError ?? "Invalid crochet repeat syntax",
      };
    }

    return {
      normalizedTokens: Array.from(
        { length: repeatCount },
        () => parsed.normalizedTokens,
      ).flat(),
      parsedSteps: Array.from({ length: repeatCount }, () => parsed.parsedSteps).flat(),
      parseError: parsed.parseError,
    };
  }

  const directParse = parseCrochetSequence(trimmed);
  const plainRepeatMatch = trimmed.match(/^(.+?)\s*(?:REPEAT|반복|X)\s*(\d+)$/i);

  if (!directParse.parseError) {
    return directParse;
  }

  if (plainRepeatMatch) {
    const parsed = parseCrochetSequence(plainRepeatMatch[1]);
    const repeatCount = Number.parseInt(plainRepeatMatch[2], 10);

    if (parsed.parsedSteps.length === 0 || Number.isNaN(repeatCount) || repeatCount < 1) {
      return {
        normalizedTokens: [],
        parsedSteps: [],
        parseError: parsed.parseError ?? "Invalid crochet repeat syntax",
      };
    }

    return {
      normalizedTokens: Array.from(
        { length: repeatCount },
        () => parsed.normalizedTokens,
      ).flat(),
      parsedSteps: Array.from({ length: repeatCount }, () => parsed.parsedSteps).flat(),
      parseError: parsed.parseError,
    };
  }

  return directParse;
}
