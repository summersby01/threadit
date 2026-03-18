function expandToken(token: string): string[] {
  const trimmedToken = token.trim().toUpperCase();

  if (!trimmedToken) {
    return [];
  }

  const match = trimmedToken.match(/^([KP])(\d+)?$/);

  if (!match) {
    return [];
  }

  const stitch = match[1];
  const count = match[2] ? Number.parseInt(match[2], 10) : 1;

  return Array.from({ length: count }, () => stitch);
}

function parseSequence(sequence: string): string[] {
  return sequence
    .split(",")
    .flatMap((token) => expandToken(token));
}

export function parsePatternRow(input: string): string[] {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return [];
  }

  const repeatMatch = trimmedInput.match(/^\*(.+)\*\s*repeat\s+(\d+)$/i);

  if (repeatMatch) {
    const repeatedSequence = parseSequence(repeatMatch[1]);
    const repeatCount = Number.parseInt(repeatMatch[2], 10);

    return Array.from({ length: repeatCount }, () => repeatedSequence).flat();
  }

  return parseSequence(trimmedInput);
}
