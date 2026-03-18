import type { ParseResult } from "@/lib/tracker/types";

const KNITTING_DELIMITER_PATTERN = /^[\s,]+/;
const KNITTING_TOKEN_PATTERN = /^([KP])\s*(\d*)/i;

function normalizeKnittingSequence(sequence: string): string {
  return sequence
    .trim()
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ");
}

function buildParseError(prefix: string, invalidFragments: string[]): string {
  if (invalidFragments.length === 0) {
    return prefix;
  }

  return `${prefix}: ${invalidFragments.join(", ")}`;
}

function expandKnittingToken(token: string): string[] {
  const normalized = token.trim().toUpperCase();

  if (!normalized) {
    return [];
  }

  const match = normalized.match(/^([KP])(\d+)?$/);

  if (!match) {
    return [];
  }

  const stitch = match[1];
  const count = match[2] ? Number.parseInt(match[2], 10) : 1;

  return Array.from({ length: count }, () => stitch);
}

function consumeInvalidFragment(sequence: string): [string, string] {
  const nextTokenIndex = sequence.slice(1).search(/[KP]/i);

  if (nextTokenIndex === -1) {
    return [sequence, ""];
  }

  const endIndex = nextTokenIndex + 1;

  return [sequence.slice(0, endIndex), sequence.slice(endIndex)];
}

function parseSequence(sequence: string): ParseResult {
  const trimmed = normalizeKnittingSequence(sequence);

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
    const delimiterMatch = remainder.match(KNITTING_DELIMITER_PATTERN);

    if (delimiterMatch) {
      remainder = remainder.slice(delimiterMatch[0].length);
      continue;
    }

    const tokenMatch = remainder.match(KNITTING_TOKEN_PATTERN);

    if (tokenMatch) {
      const stitch = tokenMatch[1].toUpperCase();
      const countText = tokenMatch[2];
      const normalizedToken = `${stitch}${countText || ""}`;

      normalizedTokens.push(normalizedToken);
      parsedSteps.push(...expandKnittingToken(normalizedToken));
      remainder = remainder.slice(tokenMatch[0].length);
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
        ? buildParseError("Could not parse knitting instructions", invalidFragments)
        : invalidFragments.length > 0
          ? buildParseError("Ignored unrecognized knitting fragment", invalidFragments)
          : null,
  };
}

function expandRepeatedKnittingSequence(
  sequence: string,
  repeatCount: number,
): ParseResult {
  const parsed = parseSequence(sequence);

  if (
    parsed.parsedSteps.length === 0 ||
    Number.isNaN(repeatCount) ||
    repeatCount < 1
  ) {
    return {
      normalizedTokens: [],
      parsedSteps: [],
      parseError: parsed.parseError ?? "Invalid knitting repeat syntax",
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

export function parseKnittingRow(input: string): ParseResult {
  const trimmed = normalizeKnittingSequence(input);

  if (!trimmed) {
    return { normalizedTokens: [], parsedSteps: [], parseError: null };
  }

  const castOnMatch = trimmed.match(/^CO\s*(\d+)$/i);

  if (castOnMatch) {
    return {
      normalizedTokens: [`CO${castOnMatch[1]}`],
      parsedSteps: [],
      parseError: null,
    };
  }

  const starredRepeatMatch = trimmed.match(
    /^\*(.+)\*\s*(?:(?:repeat|반복|x)\s*)?(\d+)$/i,
  );

  if (starredRepeatMatch) {
    return expandRepeatedKnittingSequence(
      starredRepeatMatch[1],
      Number.parseInt(starredRepeatMatch[2], 10),
    );
  }

  const groupedRepeatMatch = trimmed.match(
    /^\((.+)\)\s*(?:repeat|반복|x)\s*(\d+)$/i,
  );

  if (groupedRepeatMatch) {
    return expandRepeatedKnittingSequence(
      groupedRepeatMatch[1],
      Number.parseInt(groupedRepeatMatch[2], 10),
    );
  }

  const plainRepeatMatch = trimmed.match(
    /^(.+?)\s*(?:repeat|반복|x)\s*(\d+)$/i,
  );

  if (plainRepeatMatch) {
    return expandRepeatedKnittingSequence(
      plainRepeatMatch[1],
      Number.parseInt(plainRepeatMatch[2], 10),
    );
  }

  const steps = parseSequence(trimmed);

  return steps;
}
