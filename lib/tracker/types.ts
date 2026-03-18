export type CraftType = "knitting" | "crochet";
export type StructureType = "row" | "round";

export type PatternRow = {
  id: number;
  text: string;
  parsedSteps: string[];
  parseError: string | null;
};

export type CursorPosition = {
  currentRow: number;
  currentStep: number;
};

export type ProjectCursorState = CursorPosition & {
  isProjectComplete: boolean;
};

export type ParseResult = {
  normalizedTokens: string[];
  parsedSteps: string[];
  parseError: string | null;
};
