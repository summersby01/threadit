import { getStepPositions, normalizeProjectCursor } from "@/lib/tracker/cursor";
import type { PatternRow, ProjectCursorState } from "@/lib/tracker/types";

export function getProjectCompletionState(
  rows: PatternRow[],
  currentRow: number,
): boolean {
  return !rows.some(
    (row, index) => index > currentRow && row.parsedSteps.length > 0,
  );
}

export function completeCurrentLine(
  rows: PatternRow[],
  currentRow: number,
): ProjectCursorState {
  const positions = getStepPositions(rows);

  if (positions.length === 0) {
    return {
      currentRow: 0,
      currentStep: 0,
      isProjectComplete: false,
    };
  }

  for (let rowIndex = currentRow + 1; rowIndex < rows.length; rowIndex += 1) {
    if (rows[rowIndex].parsedSteps.length > 0) {
      return {
        currentRow: rowIndex,
        currentStep: 0,
        isProjectComplete: false,
      };
    }
  }

  const normalized = normalizeProjectCursor(rows, currentRow, 0, true);

  return normalized;
}
