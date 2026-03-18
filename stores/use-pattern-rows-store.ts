import { create } from "zustand";
import { parsePatternRow } from "@/lib/parse-pattern-row";

export type PatternRow = {
  id: number;
  text: string;
  parsedSteps: string[];
};

type PatternRowsStore = {
  rows: PatternRow[];
  currentRow: number;
  currentStep: number;
  addRow: () => void;
  updateRow: (id: number, text: string) => void;
  advanceSteps: (count: number) => void;
  undoStep: () => void;
};

const INITIAL_ROW_COUNT = 3;

function buildInitialRows(): PatternRow[] {
  return Array.from({ length: INITIAL_ROW_COUNT }, (_, index) => ({
    id: index + 1,
    text: "",
    parsedSteps: [],
  }));
}

type CursorPosition = {
  currentRow: number;
  currentStep: number;
};

function getStepPositions(rows: PatternRow[]): CursorPosition[] {
  return rows.flatMap((row, rowIndex) =>
    row.parsedSteps.map((_, stepIndex) => ({
      currentRow: rowIndex,
      currentStep: stepIndex,
    })),
  );
}

function normalizeCursor(
  rows: PatternRow[],
  currentRow: number,
  currentStep: number,
): CursorPosition {
  const positions = getStepPositions(rows);

  if (positions.length === 0) {
    return { currentRow: 0, currentStep: 0 };
  }

  const existingPosition = positions.find(
    (position) =>
      position.currentRow === currentRow && position.currentStep === currentStep,
  );

  return existingPosition ?? positions[0];
}

function moveCursor(
  rows: PatternRow[],
  currentRow: number,
  currentStep: number,
  delta: number,
): CursorPosition {
  const positions = getStepPositions(rows);

  if (positions.length === 0) {
    return { currentRow: 0, currentStep: 0 };
  }

  const currentIndex = positions.findIndex(
    (position) =>
      position.currentRow === currentRow && position.currentStep === currentStep,
  );

  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = Math.min(
    positions.length - 1,
    Math.max(0, safeIndex + delta),
  );

  return positions[nextIndex];
}

export const usePatternRowsStore = create<PatternRowsStore>((set) => ({
  rows: buildInitialRows(),
  currentRow: 0,
  currentStep: 0,
  addRow: () =>
    set((state) => {
      const nextId =
        state.rows.length > 0 ? state.rows[state.rows.length - 1].id + 1 : 1;

      return {
        rows: [...state.rows, { id: nextId, text: "", parsedSteps: [] }],
      };
    }),
  updateRow: (id, text) =>
    set((state) => {
      const rows = state.rows.map((row) =>
        row.id === id
          ? { ...row, text, parsedSteps: parsePatternRow(text) }
          : row,
      );
      const cursor = normalizeCursor(rows, state.currentRow, state.currentStep);

      return {
        rows,
        currentRow: cursor.currentRow,
        currentStep: cursor.currentStep,
      };
    }),
  advanceSteps: (count) =>
    set((state) => {
      const cursor = moveCursor(
        state.rows,
        state.currentRow,
        state.currentStep,
        count,
      );

      return {
        currentRow: cursor.currentRow,
        currentStep: cursor.currentStep,
      };
    }),
  undoStep: () =>
    set((state) => {
      const cursor = moveCursor(
        state.rows,
        state.currentRow,
        state.currentStep,
        -1,
      );

      return {
        currentRow: cursor.currentRow,
        currentStep: cursor.currentStep,
      };
    }),
}));
