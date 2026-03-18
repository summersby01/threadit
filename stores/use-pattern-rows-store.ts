import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { completeCurrentLine } from "@/lib/tracker/completion";
import {
  getNextCursor,
  normalizeProjectCursor,
} from "@/lib/tracker/cursor";
import { parseProjectRow, parseProjectRows } from "@/lib/tracker/parse-project-rows";
import type { CraftType, PatternRow, StructureType } from "@/lib/tracker/types";

export type { CraftType, PatternRow, StructureType } from "@/lib/tracker/types";

type MemoryStorageValue = Record<string, string>;

type StoredActivityLogEntry = {
  id?: string;
  label?: string;
  createdAt?: string;
};

const memoryStorage: Storage = {
  getItem: (name) => memoryStorageState[name] ?? null,
  setItem: (name, value) => {
    memoryStorageState[name] = value;
  },
  removeItem: (name) => {
    delete memoryStorageState[name];
  },
  clear: () => {
    Object.keys(memoryStorageState).forEach((key) => {
      delete memoryStorageState[key];
    });
  },
  key: (index) => Object.keys(memoryStorageState)[index] ?? null,
  get length() {
    return Object.keys(memoryStorageState).length;
  },
};

const memoryStorageState: MemoryStorageValue = {};

function getSafeStorage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return memoryStorage;
}

export type TrackerProject = {
  id: string;
  userId: string | null;
  name: string;
  craftType: CraftType;
  structureType: StructureType;
  startDirection: "right" | "left";
  startSide: "RS" | "WS";
  rows: PatternRow[];
  currentRow: number;
  currentStep: number;
  isProjectComplete: boolean;
  notes: string;
  activityLog: {
    id: string;
    label: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

type DraftProject = {
  name: string;
  craftType: CraftType | null;
  structureType: StructureType;
  startDirection: "right" | "left";
  startSide: "RS" | "WS";
  rows: PatternRow[];
};

type PatternRowsStore = {
  currentUserId: string | null;
  draftProject: DraftProject;
  projects: TrackerProject[];
  selectedProjectId: string | null;
  setDraftProjectName: (projectName: string) => void;
  setDraftCraftType: (craftType: CraftType) => void;
  setDraftStructureType: (structureType: StructureType) => void;
  setDraftStartDirection: (direction: "right" | "left") => void;
  setDraftStartSide: (side: "RS" | "WS") => void;
  addDraftRow: () => void;
  duplicateDraftRow: (id: number) => void;
  deleteDraftRow: (id: number) => void;
  updateDraftRow: (id: number, text: string) => void;
  createProject: () => string | null;
  selectProject: (id: string | null) => void;
  duplicateProject: (id: string) => string | null;
  toggleProjectDirection: (id: string) => void;
  toggleProjectStartSide: (id: string) => void;
  updateProjectFutureRows: (
    id: string,
    updates: Array<{ id: number; text: string }>,
  ) => void;
  setProjectNotes: (id: string, notes: string) => void;
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
    structureType: "row",
    startDirection: "right",
    startSide: "RS",
    rows: buildInitialRows(),
  };
}

function buildCastOnRow(id = 1, stitchCount = 0): PatternRow {
  return {
    id,
    text: `CO ${stitchCount}`,
    parsedSteps: [],
    parseError: null,
  };
}

function isCastOnText(text: string): boolean {
  return /^CO\s*\d+$/i.test(text.trim());
}

function ensureKnittingRows(rows: PatternRow[]): PatternRow[] {
  const nonCastOnRows = rows.filter((row, index) =>
    index === 0 ? !isCastOnText(row.text) : !isCastOnText(row.text),
  );

  return [buildCastOnRow(1), ...nonCastOnRows].map((row, index) => ({
    ...row,
    id: index + 1,
  }));
}

function stripCastOnRow(rows: PatternRow[]): PatternRow[] {
  const nextRows = rows.filter((row, index) => !(index === 0 && isCastOnText(row.text)));

  return nextRows.map((row, index) => ({
    ...row,
    id: index + 1,
  }));
}

function getNextRowId(rows: PatternRow[]): number {
  return rows.reduce((maxId, row) => Math.max(maxId, row.id), 0) + 1;
}

function getDefaultStructureType(craftType: CraftType): StructureType {
  return craftType === "crochet" ? "round" : "row";
}

function buildProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function appendActivity(
  project: TrackerProject,
  label: string,
): TrackerProject["activityLog"] {
  return [
    {
      id: buildActivityId(),
      label,
      createdAt: new Date().toISOString(),
    },
    ...project.activityLog,
  ].slice(0, 8);
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

function sanitizePatternRows(rows: unknown): PatternRow[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row, index) => {
    const currentRow = row as Partial<PatternRow> | null | undefined;

    return {
      id:
        typeof currentRow?.id === "number" && Number.isFinite(currentRow.id)
          ? currentRow.id
          : index + 1,
      text: typeof currentRow?.text === "string" ? currentRow.text : "",
      parsedSteps: Array.isArray(currentRow?.parsedSteps)
        ? currentRow.parsedSteps.filter(
            (step): step is string => typeof step === "string",
          )
        : [],
      parseError:
        typeof currentRow?.parseError === "string" || currentRow?.parseError === null
          ? currentRow.parseError
          : null,
    };
  });
}

function sanitizeActivityLogEntries(entries: unknown) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry, index) => {
      const currentEntry = entry as StoredActivityLogEntry | null | undefined;

      if (!currentEntry || typeof currentEntry.label !== "string") {
        return null;
      }

      return {
        id:
          typeof currentEntry.id === "string" && currentEntry.id.length > 0
            ? currentEntry.id
            : `activity-migrated-${index}`,
        label: currentEntry.label,
        createdAt:
          typeof currentEntry.createdAt === "string" && currentEntry.createdAt.length > 0
            ? currentEntry.createdAt
            : new Date(0).toISOString(),
      };
    })
    .filter((entry): entry is TrackerProject["activityLog"][number] => entry !== null);
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
          const draftRows =
            craftType === "knitting"
              ? ensureKnittingRows(state.draftProject.rows)
              : stripCastOnRow(state.draftProject.rows);
          const rows = parseProjectRows(craftType, draftRows);

          return {
            draftProject: {
              ...state.draftProject,
              craftType,
              structureType: getDefaultStructureType(craftType),
              rows,
            },
          };
        }),
      setDraftStructureType: (structureType) =>
        set((state) => ({
          draftProject: {
            ...state.draftProject,
            structureType:
              state.draftProject.craftType === "knitting"
                ? "row"
                : structureType,
          },
        })),
      setDraftStartDirection: (startDirection) =>
        set((state) => ({
          draftProject: {
            ...state.draftProject,
            startDirection,
          },
        })),
      setDraftStartSide: (startSide) =>
        set((state) => ({
          draftProject: {
            ...state.draftProject,
            startSide,
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

          if (
            sourceIndex === -1 ||
            (state.draftProject.craftType === "knitting" && sourceIndex === 0)
          ) {
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

          const targetIndex = state.draftProject.rows.findIndex((row) => row.id === id);

          if (
            targetIndex === -1 ||
            (state.draftProject.craftType === "knitting" && targetIndex === 0)
          ) {
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
          const draftRows =
            craftType === "knitting"
              ? ensureKnittingRows(state.draftProject.rows)
              : state.draftProject.rows;
          const rows = parseProjectRows(craftType, draftRows);
          const cursor = normalizeProjectCursor(rows, 0, 0, false);
          const timestamp = new Date().toISOString();
          const nextProject: TrackerProject = {
            id: buildProjectId(),
            userId: state.currentUserId,
            name: state.draftProject.name.trim() || "Untitled Project",
            craftType,
            structureType:
              craftType === "knitting" ? "row" : state.draftProject.structureType,
            startDirection: state.draftProject.startDirection,
            startSide: state.draftProject.startSide,
            rows,
            currentRow: cursor.currentRow,
            currentStep: cursor.currentStep,
            isProjectComplete: cursor.isProjectComplete,
            notes: "",
            activityLog: [],
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
      duplicateProject: (id) => {
        let duplicatedProjectId: string | null = null;

        set((state) => {
          const sourceProject = state.projects.find((project) => project.id === id);

          if (!sourceProject) {
            return state;
          }

          const rows = sourceProject.rows.map((row) => ({
            ...row,
            parsedSteps: [...row.parsedSteps],
          }));
          const cursor = normalizeProjectCursor(rows, 0, 0, false);
          const timestamp = new Date().toISOString();
          const nextProject: TrackerProject = {
            ...sourceProject,
            id: buildProjectId(),
            name: `${sourceProject.name} Copy`,
            rows,
            currentRow: cursor.currentRow,
            currentStep: cursor.currentStep,
            isProjectComplete: cursor.isProjectComplete,
            notes: "",
            activityLog: [],
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          duplicatedProjectId = nextProject.id;

          return {
            projects: [nextProject, ...state.projects],
            selectedProjectId: nextProject.id,
          };
        });

        return duplicatedProjectId;
      },
      toggleProjectDirection: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            startDirection:
              project.startDirection === "right" ? "left" : "right",
          })),
          selectedProjectId: id,
        })),
      toggleProjectStartSide: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            startSide: project.startSide === "RS" ? "WS" : "RS",
          })),
          selectedProjectId: id,
        })),
      updateProjectFutureRows: (id, updates) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => {
            if (updates.length === 0 || project.isProjectComplete) {
              return project;
            }

            const updateMap = new Map(updates.map((update) => [update.id, update.text]));
            const rows = project.rows.map((row, rowIndex) => {
              if (rowIndex <= project.currentRow) {
                return row;
              }

              const nextText = updateMap.get(row.id);

              if (nextText === undefined || nextText === row.text) {
                return row;
              }

              const parsed = parseProjectRow(project.craftType, nextText);

              return {
                ...row,
                text: nextText,
                parsedSteps: parsed.parsedSteps,
                parseError: parsed.parseError,
              };
            });

            return {
              ...project,
              rows,
              activityLog: appendActivity(project, "Edit Future Rows"),
            };
          }),
          selectedProjectId: id,
        })),
      setProjectNotes: (id, notes) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            notes,
          })),
          selectedProjectId: id,
        })),
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
            activityLog:
              count > 0
                ? appendActivity(project, `+${count}`)
                : project.activityLog,
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
            activityLog: appendActivity(project, "Undo"),
          })),
          selectedProjectId: id,
        })),
      completeProjectLine: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            ...completeCurrentLine(project.rows, project.currentRow),
            activityLog: appendActivity(
              project,
              project.structureType === "round" ? "Complete Round" : "Complete Row",
            ),
          })),
          selectedProjectId: id,
        })),
    }),
    {
      name: "threadit-projects-store",
      version: 4,
      storage: createJSONStorage(getSafeStorage),
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
          draftProject: state?.draftProject
            ? {
                ...buildDraftProject(),
                ...state.draftProject,
                structureType:
                  (state.draftProject as DraftProject & { workMode?: StructureType })
                    .structureType ??
                  (state.draftProject as DraftProject & { workMode?: StructureType })
                    .workMode ??
                  "row",
              }
            : buildDraftProject(),
          projects:
            state?.projects?.map((project) => ({
              ...project,
              userId: project.userId ?? null,
              rows: sanitizePatternRows(project.rows),
              structureType:
                (project as TrackerProject & { workMode?: StructureType })
                  .structureType ??
                (project as TrackerProject & { workMode?: StructureType }).workMode ??
                "row",
              startDirection: project.startDirection ?? "right",
              startSide: project.startSide ?? "RS",
              notes: project.notes ?? "",
              activityLog: sanitizeActivityLogEntries(project.activityLog),
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
