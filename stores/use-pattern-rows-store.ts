import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { completeCurrentLine } from "@/lib/tracker/completion";
import {
  getNextCursor,
  normalizeProjectCursor,
} from "@/lib/tracker/cursor";
import { parseProjectRow, parseProjectRows } from "@/lib/tracker/parse-project-rows";
import type { CraftType, PatternRow, WorkMode } from "@/lib/tracker/types";

export type { CraftType, PatternRow, WorkMode } from "@/lib/tracker/types";

export type TrackerProject = {
  id: string;
  userId: string | null;
  name: string;
  craftType: CraftType;
  workMode: WorkMode;
  rows: PatternRow[];
  currentRow: number;
  currentStep: number;
  isProjectComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

type DraftProject = {
  name: string;
  craftType: CraftType | null;
  workMode: WorkMode;
  rows: PatternRow[];
};

type PatternRowsStore = {
  currentUserId: string | null;
  draftProject: DraftProject;
  projects: TrackerProject[];
  selectedProjectId: string | null;
  setDraftProjectName: (projectName: string) => void;
  setDraftCraftType: (craftType: CraftType) => void;
  setDraftWorkMode: (workMode: WorkMode) => void;
  addDraftRow: () => void;
  duplicateDraftRow: (id: number) => void;
  deleteDraftRow: (id: number) => void;
  updateDraftRow: (id: number, text: string) => void;
  createProject: () => string | null;
  selectProject: (id: string | null) => void;
  advanceProjectSteps: (id: string, count: number) => void;
  undoProjectStep: (id: string) => void;
  completeProjectLine: (id: string) => void;
};

const INITIAL_ROW_COUNT = 3;

function buildInitialRows(): PatternRow[] {
  return Array.from({ length: INITIAL_ROW_COUNT }, (_, index) => ({
    id: index + 1,
    text: "",
    parsedSteps: [],
    parseError: null,
  }));
}

function buildDraftProject(): DraftProject {
  return {
    name: "",
    craftType: null,
    workMode: "row",
    rows: buildInitialRows(),
  };
}

function getNextRowId(rows: PatternRow[]): number {
  return rows.reduce((maxId, row) => Math.max(maxId, row.id), 0) + 1;
}

function getDefaultWorkMode(craftType: CraftType): WorkMode {
  return craftType === "crochet" ? "round" : "row";
}

function buildProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function touchProject(project: TrackerProject): TrackerProject {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
  };
}

function updateProjectById(
  projects: TrackerProject[],
  id: string,
  updater: (project: TrackerProject) => TrackerProject,
): TrackerProject[] {
  return projects.map((project) =>
    project.id === id ? touchProject(updater(project)) : project,
  );
}

export const usePatternRowsStore = create<PatternRowsStore>()(
  persist(
    (set) => ({
      draftProject: buildDraftProject(),
      currentUserId: null,
      projects: [],
      selectedProjectId: null,
      setDraftProjectName: (name) =>
        set((state) => ({
          draftProject: {
            ...state.draftProject,
            name,
          },
        })),
      setDraftCraftType: (craftType) =>
        set((state) => {
          const rows = parseProjectRows(craftType, state.draftProject.rows);

          return {
            draftProject: {
              ...state.draftProject,
              craftType,
              workMode: getDefaultWorkMode(craftType),
              rows,
            },
          };
        }),
      setDraftWorkMode: (workMode) =>
        set((state) => ({
          draftProject: {
            ...state.draftProject,
            workMode,
          },
        })),
      addDraftRow: () =>
        set((state) => {
          const nextId = getNextRowId(state.draftProject.rows);

          return {
            draftProject: {
              ...state.draftProject,
              rows: [
                ...state.draftProject.rows,
                { id: nextId, text: "", parsedSteps: [], parseError: null },
              ],
            },
          };
        }),
      duplicateDraftRow: (id) =>
        set((state) => {
          const sourceIndex = state.draftProject.rows.findIndex(
            (row) => row.id === id,
          );

          if (sourceIndex === -1) {
            return state;
          }

          const sourceRow = state.draftProject.rows[sourceIndex];
          const duplicatedRow: PatternRow = {
            id: getNextRowId(state.draftProject.rows),
            text: sourceRow.text,
            parsedSteps: [...sourceRow.parsedSteps],
            parseError: sourceRow.parseError,
          };
          const rows = [...state.draftProject.rows];

          rows.splice(sourceIndex + 1, 0, duplicatedRow);

          return {
            draftProject: {
              ...state.draftProject,
              rows,
            },
          };
        }),
      deleteDraftRow: (id) =>
        set((state) => {
          if (state.draftProject.rows.length <= 1) {
            return state;
          }

          const rows = state.draftProject.rows.filter((row) => row.id !== id);

          if (rows.length === state.draftProject.rows.length) {
            return state;
          }

          return {
            draftProject: {
              ...state.draftProject,
              rows,
            },
          };
        }),
      updateDraftRow: (id, text) =>
        set((state) => {
          const rows = state.draftProject.rows.map((row) =>
            row.id === id
              ? (() => {
                  const parsed = parseProjectRow(state.draftProject.craftType, text);

                  return {
                    ...row,
                    text,
                    parsedSteps: parsed.parsedSteps,
                    parseError: parsed.parseError,
                  };
                })()
              : row,
          );

          return {
            draftProject: {
              ...state.draftProject,
              rows,
            },
          };
        }),
      createProject: () => {
        let createdProjectId: string | null = null;

        set((state) => {
          if (!state.draftProject.craftType) {
            return state;
          }

          const craftType = state.draftProject.craftType;
          const rows = parseProjectRows(craftType, state.draftProject.rows);
          const cursor = normalizeProjectCursor(rows, 0, 0, false);
          const timestamp = new Date().toISOString();
          const nextProject: TrackerProject = {
            id: buildProjectId(),
            userId: state.currentUserId,
            name: state.draftProject.name.trim() || "Untitled Project",
            craftType,
            workMode: state.draftProject.workMode,
            rows,
            currentRow: cursor.currentRow,
            currentStep: cursor.currentStep,
            isProjectComplete: cursor.isProjectComplete,
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          createdProjectId = nextProject.id;

          return {
            projects: [nextProject, ...state.projects],
            selectedProjectId: nextProject.id,
            draftProject: buildDraftProject(),
          };
        });

        return createdProjectId;
      },
      selectProject: (id) => set({ selectedProjectId: id }),
      advanceProjectSteps: (id, count) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            ...getNextCursor(
              project.rows,
              project.currentRow,
              project.currentStep,
              count,
              project.isProjectComplete,
            ),
          })),
          selectedProjectId: id,
        })),
      undoProjectStep: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            ...getNextCursor(
              project.rows,
              project.currentRow,
              project.currentStep,
              -1,
              project.isProjectComplete,
            ),
          })),
          selectedProjectId: id,
        })),
      completeProjectLine: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            ...completeCurrentLine(project.rows, project.currentRow),
          })),
          selectedProjectId: id,
        })),
    }),
    {
      name: "threadit-projects-store",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        draftProject: state.draftProject,
        projects: state.projects,
        selectedProjectId: state.selectedProjectId,
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<PatternRowsStore> | undefined;

        return {
          currentUserId: state?.currentUserId ?? null,
          draftProject: state?.draftProject ?? buildDraftProject(),
          projects:
            state?.projects?.map((project) => ({
              ...project,
              userId: project.userId ?? null,
            })) ?? [],
          selectedProjectId: state?.selectedProjectId ?? null,
        } satisfies Pick<
          PatternRowsStore,
          "currentUserId" | "draftProject" | "projects" | "selectedProjectId"
        >;
      },
    },
  ),
);
