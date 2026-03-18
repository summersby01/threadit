import type {
  CursorPosition,
  PatternRow,
  ProjectCursorState,
} from "@/lib/tracker/types";

export function getStepPositions(rows: PatternRow[]): CursorPosition[] {
  return rows.flatMap((row, rowIndex) =>
    row.parsedSteps.map((_, stepIndex) => ({
      currentRow: rowIndex,
      currentStep: stepIndex,
    })),
  );
}

export function normalizeCursor(
  rows: PatternRow[],
  currentRow: number,
  currentStep: number,
): CursorPosition {
  const positions = getStepPositions(rows);

  if (positions.length === 0) {
    return { currentRow: 0, currentStep: 0 };
  }

  const existing = positions.find(
    (position) =>
      position.currentRow === currentRow && position.currentStep === currentStep,
  );

  return existing ?? positions[0];
}

export function normalizeProjectCursor(
  rows: PatternRow[],
  currentRow: number,
  currentStep: number,
  isProjectComplete: boolean,
): ProjectCursorState {
  const positions = getStepPositions(rows);

  if (positions.length === 0) {
    return {
      currentRow: 0,
      currentStep: 0,
      isProjectComplete: false,
    };
  }

  if (isProjectComplete) {
    const lastPosition = positions[positions.length - 1];

    return {
      ...lastPosition,
      isProjectComplete: true,
    };
  }

  const cursor = normalizeCursor(rows, currentRow, currentStep);

  return {
    ...cursor,
    isProjectComplete: false,
  };
}

export function getNextCursor(
  rows: PatternRow[],
  currentRow: number,
  currentStep: number,
  delta: number,
  isProjectComplete: boolean,
): ProjectCursorState {
  const positions = getStepPositions(rows);

  if (positions.length === 0) {
    return {
      currentRow: 0,
      currentStep: 0,
      isProjectComplete: false,
    };
  }

  const currentIndex = isProjectComplete
    ? positions.length
    : positions.findIndex(
        (position) =>
          position.currentRow === currentRow &&
          position.currentStep === currentStep,
      );
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = Math.min(
    positions.length,
    Math.max(0, safeIndex + delta),
  );
  const nextIsComplete = nextIndex >= positions.length;
  const cursor = nextIsComplete
    ? positions[positions.length - 1]
    : positions[nextIndex];

  return {
    currentRow: cursor.currentRow,
    currentStep: cursor.currentStep,
    isProjectComplete: nextIsComplete,
  };
}
