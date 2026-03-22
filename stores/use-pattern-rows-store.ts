import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { completeCurrentLine } from "@/lib/tracker/completion";
import { getNextCursor, normalizeProjectCursor } from "@/lib/tracker/cursor";
import { parseProjectRow, parseProjectRows } from "@/lib/tracker/parse-project-rows";
import type {
  CraftType,
  PatternRow,
  StructureType,
  TrackingMode,
} from "@/lib/tracker/types";

export type {
  CraftType,
  PatternRow,
  StructureType,
  TrackingMode,
} from "@/lib/tracker/types";

export type PatternAssetType = "pdf" | "image" | "link" | "youtube";

export type PatternAsset = {
  id: string;
  title: string;
  type: PatternAssetType;
  sourceUrl: string;
  category: string;
  tags: string[];
  note: string;
  createdAt: string;
};

export type PatternAssetInput = {
  title: string;
  type: PatternAssetType;
  sourceUrl: string;
  category: string;
  tags: string[];
  note?: string;
};

type MemoryStorageValue = Record<string, string>;

type StoredActivityLogEntry = {
  id?: string;
  label?: string;
  createdAt?: string;
};

const memoryStorageState: MemoryStorageValue = {};

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
  trackingMode: TrackingMode;
  startDirection: "right" | "left";
  startSide: "RS" | "WS";
  rows: PatternRow[];
  progressTargetCount: number;
  countValue: number;
  currentRow: number;
  currentStep: number;
  isCompleted: boolean;
  completedAt: string | null;
  isProjectComplete: boolean;
  notes: string;
  patternAssetIds: string[];
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
  trackingMode: TrackingMode;
  startDirection: "right" | "left";
  startSide: "RS" | "WS";
  rows: PatternRow[];
  progressTargetCount: number;
  patternAssetIds: string[];
};

type PatternRowsStore = {
  currentUserId: string | null;
  draftProject: DraftProject;
  projects: TrackerProject[];
  patternAssets: PatternAsset[];
  selectedProjectId: string | null;
  setDraftProjectName: (projectName: string) => void;
  setDraftCraftType: (craftType: CraftType) => void;
  setDraftStructureType: (structureType: StructureType) => void;
  setDraftTrackingMode: (trackingMode: TrackingMode) => void;
  setDraftProgressTargetCount: (count: number) => void;
  setDraftPatternAssetIds: (ids: string[]) => void;
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
  setProjectPatternAssetIds: (id: string, assetIds: string[]) => void;
  setProjectProgressTargetCount: (id: string, count: number) => void;
  markProjectComplete: (id: string) => void;
  setProjectNotes: (id: string, notes: string) => void;
  advanceProjectSteps: (id: string, count: number) => void;
  undoProjectStep: (id: string) => void;
  completeProjectLine: (id: string) => void;
  addPatternAsset: (input: PatternAssetInput) => string | null;
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
    trackingMode: "pattern",
    startDirection: "right",
    startSide: "RS",
    rows: buildInitialRows(),
    progressTargetCount: 20,
    patternAssetIds: [],
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
  const nonCastOnRows = rows.filter((row) => !isCastOnText(row.text));

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

function buildPatternAssetId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function normalizeProgressTargetCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function sanitizePatternAssetType(value: unknown): PatternAssetType {
  return value === "pdf" || value === "image" || value === "youtube" ? value : "link";
}

function sanitizePatternAssetIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function sanitizePatternAssetTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizePatternAssets(assets: unknown): PatternAsset[] {
  if (!Array.isArray(assets)) {
    return [];
  }

  return assets
    .map((asset, index) => {
      const currentAsset = asset as Partial<PatternAsset> | null | undefined;

      if (
        !currentAsset ||
        typeof currentAsset.title !== "string" ||
        typeof currentAsset.sourceUrl !== "string"
      ) {
        return null;
      }

      return {
        id:
          typeof currentAsset.id === "string" && currentAsset.id.length > 0
            ? currentAsset.id
            : `asset-migrated-${index}`,
        title: currentAsset.title.trim() || "Untitled Asset",
        type: sanitizePatternAssetType(currentAsset.type),
        sourceUrl: currentAsset.sourceUrl,
        category:
          typeof currentAsset.category === "string" ? currentAsset.category.trim() : "",
        tags: sanitizePatternAssetTags(currentAsset.tags),
        note: typeof currentAsset.note === "string" ? currentAsset.note : "",
        createdAt:
          typeof currentAsset.createdAt === "string" && currentAsset.createdAt.length > 0
            ? currentAsset.createdAt
            : new Date(0).toISOString(),
      } satisfies PatternAsset;
    })
    .filter((asset): asset is PatternAsset => asset !== null);
}

function normalizeProgressProject(
  current: number,
  target: number,
): Pick<
  TrackerProject,
  | "currentRow"
  | "currentStep"
  | "countValue"
  | "isCompleted"
  | "completedAt"
  | "isProjectComplete"
> {
  const safeTarget = normalizeProgressTargetCount(target);
  const safeCurrent = Math.min(Math.max(0, Math.floor(current)), safeTarget);

  return {
    currentRow: safeCurrent,
    currentStep: 0,
    countValue: 0,
    isCompleted: safeTarget > 0 && safeCurrent >= safeTarget,
    completedAt: safeTarget > 0 && safeCurrent >= safeTarget ? new Date().toISOString() : null,
    isProjectComplete: safeTarget > 0 && safeCurrent >= safeTarget,
  };
}

function normalizeCounterProject(
  count: number,
): Pick<
  TrackerProject,
  | "currentRow"
  | "currentStep"
  | "countValue"
  | "isCompleted"
  | "completedAt"
  | "isProjectComplete"
> {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));

  return {
    currentRow: 0,
    currentStep: 0,
    countValue: safeCount,
    isCompleted: false,
    completedAt: null,
    isProjectComplete: false,
  };
}

function normalizeStoredTrackingMode(value: unknown): TrackingMode {
  if (value === "detailed") {
    return "pattern";
  }

  if (value === "simple") {
    return "progress";
  }

  return value === "progress" || value === "counter" ? value : "pattern";
}

export const usePatternRowsStore = create<PatternRowsStore>()(
  persist(
    (set) => ({
      draftProject: buildDraftProject(),
      currentUserId: null,
      projects: [],
      patternAssets: [],
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
          const rows =
            state.draftProject.trackingMode === "pattern"
              ? parseProjectRows(craftType, draftRows)
              : draftRows;

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
      setDraftTrackingMode: (trackingMode) =>
        set((state) => {
          const craftType = state.draftProject.craftType;
          const baseRows =
            craftType === "knitting"
              ? ensureKnittingRows(state.draftProject.rows)
              : stripCastOnRow(state.draftProject.rows);

          return {
            draftProject: {
              ...state.draftProject,
              trackingMode,
              rows:
                trackingMode === "pattern" && craftType
                  ? parseProjectRows(craftType, baseRows)
                  : baseRows,
            },
          };
        }),
      setDraftProgressTargetCount: (count) =>
        set((state) => ({
          draftProject: {
            ...state.draftProject,
            progressTargetCount: normalizeProgressTargetCount(count),
          },
        })),
      setDraftPatternAssetIds: (patternAssetIds) =>
        set((state) => ({
          draftProject: {
            ...state.draftProject,
            patternAssetIds,
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
          const sourceIndex = state.draftProject.rows.findIndex((row) => row.id === id);

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
                  const parsed =
                    state.draftProject.trackingMode === "pattern"
                      ? parseProjectRow(state.draftProject.craftType, text)
                      : { parsedSteps: [], parseError: null };

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

          const timestamp = new Date().toISOString();
          const craftType = state.draftProject.craftType;
          const trackingMode = state.draftProject.trackingMode;
          const structureType =
            craftType === "knitting" ? "row" : state.draftProject.structureType;
          const progressTargetCount = normalizeProgressTargetCount(
            state.draftProject.progressTargetCount,
          );

          if (trackingMode === "progress" && progressTargetCount <= 0) {
            return state;
          }

          const draftRows =
            craftType === "knitting"
              ? ensureKnittingRows(state.draftProject.rows)
              : state.draftProject.rows;
          const rows =
            trackingMode === "pattern" ? parseProjectRows(craftType, draftRows) : [];
          const cursor =
            trackingMode === "pattern"
              ? {
                  ...normalizeProjectCursor(rows, 0, 0, false),
                  countValue: 0,
                  isCompleted: false,
                  completedAt: null,
                }
              : trackingMode === "progress"
                ? normalizeProgressProject(0, progressTargetCount)
                : normalizeCounterProject(0);

          const nextProject: TrackerProject = {
            id: buildProjectId(),
            userId: state.currentUserId,
            name: state.draftProject.name.trim() || "Untitled Project",
            craftType,
            structureType,
            trackingMode,
            startDirection: state.draftProject.startDirection,
            startSide: state.draftProject.startSide,
            rows,
            progressTargetCount,
            countValue: cursor.countValue,
            currentRow: cursor.currentRow,
            currentStep: cursor.currentStep,
            isCompleted: cursor.isCompleted,
            completedAt: cursor.completedAt,
            isProjectComplete: cursor.isProjectComplete,
            notes: "",
            patternAssetIds: state.draftProject.patternAssetIds,
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
          const patternCursor = {
            ...normalizeProjectCursor(rows, 0, 0, false),
            countValue: 0,
            isCompleted: false,
            completedAt: null,
          };
          const progressCursor = normalizeProgressProject(
            0,
            sourceProject.progressTargetCount,
          );
          const counterCursor = normalizeCounterProject(0);
          const cursor =
            sourceProject.trackingMode === "pattern"
              ? patternCursor
              : sourceProject.trackingMode === "progress"
                ? progressCursor
                : counterCursor;
          const timestamp = new Date().toISOString();
          const nextProject: TrackerProject = {
            ...sourceProject,
            id: buildProjectId(),
            name: `${sourceProject.name} Copy`,
            rows,
            countValue: cursor.countValue,
            currentRow: cursor.currentRow,
            currentStep: cursor.currentStep,
            isCompleted: cursor.isCompleted,
            completedAt: cursor.completedAt,
            isProjectComplete: cursor.isProjectComplete,
            notes: "",
            patternAssetIds: sourceProject.patternAssetIds,
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
            startDirection: project.startDirection === "right" ? "left" : "right",
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
            if (
              project.trackingMode !== "pattern" ||
              updates.length === 0 ||
              project.isProjectComplete
            ) {
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
      setProjectPatternAssetIds: (id, patternAssetIds) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => ({
            ...project,
            patternAssetIds,
            activityLog: appendActivity(project, "Update Pattern Assets"),
          })),
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
          projects: updateProjectById(state.projects, id, (project) => {
            if (project.trackingMode === "progress") {
              return {
                ...project,
              ...normalizeProgressProject(
                project.currentRow + count,
                project.progressTargetCount,
              ),
                activityLog:
                  count > 0
                    ? appendActivity(project, `+${count}`)
                    : project.activityLog,
              };
            }

            if (project.trackingMode === "counter") {
              return {
                ...project,
                ...normalizeCounterProject(project.countValue + count),
                activityLog:
                  count > 0
                    ? appendActivity(project, `+${count}`)
                    : project.activityLog,
              };
            }

            const nextCursor = getNextCursor(
              project.rows,
              project.currentRow,
              project.currentStep,
              count,
              project.isProjectComplete,
            );

            return {
              ...project,
              ...nextCursor,
              isCompleted: nextCursor.isProjectComplete,
              completedAt: nextCursor.isProjectComplete ? new Date().toISOString() : null,
              activityLog:
                count > 0
                  ? appendActivity(project, `+${count}`)
                  : project.activityLog,
            };
          }),
          selectedProjectId: id,
        })),
      undoProjectStep: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => {
            if (project.trackingMode === "progress") {
              return {
                ...project,
                ...normalizeProgressProject(
                  project.currentRow - 1,
                  project.progressTargetCount,
                ),
                activityLog: appendActivity(project, "Undo"),
              };
            }

            if (project.trackingMode === "counter") {
              return {
                ...project,
                ...normalizeCounterProject(project.countValue - 1),
                activityLog: appendActivity(project, "Undo"),
              };
            }

            const nextCursor = getNextCursor(
              project.rows,
              project.currentRow,
              project.currentStep,
              -1,
              project.isProjectComplete,
            );

            return {
              ...project,
              ...nextCursor,
              isCompleted: nextCursor.isProjectComplete,
              completedAt: nextCursor.isProjectComplete ? project.completedAt : null,
              activityLog: appendActivity(project, "Undo"),
            };
          }),
          selectedProjectId: id,
        })),
      completeProjectLine: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => {
            if (project.trackingMode === "progress") {
              return {
                ...project,
                ...normalizeProgressProject(
                  project.progressTargetCount,
                  project.progressTargetCount,
                ),
                activityLog: appendActivity(project, "Complete Project"),
              };
            }

            if (project.trackingMode === "counter") {
              return project;
            }

            const nextCursor = completeCurrentLine(project.rows, project.currentRow);

            return {
              ...project,
              ...nextCursor,
              isCompleted: nextCursor.isProjectComplete,
              completedAt: nextCursor.isProjectComplete ? new Date().toISOString() : null,
              activityLog: appendActivity(
                project,
                project.structureType === "round" ? "Complete Round" : "Complete Row",
              ),
            };
          }),
          selectedProjectId: id,
        })),
      setProjectProgressTargetCount: (id, count) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => {
            if (project.trackingMode !== "progress") {
              return project;
            }

            const normalizedCount = normalizeProgressTargetCount(count);
            const progress = normalizeProgressProject(project.currentRow, normalizedCount);

            return {
              ...project,
              progressTargetCount: normalizedCount,
              ...progress,
              activityLog: appendActivity(project, `Set Total ${normalizedCount}`),
            };
          }),
          selectedProjectId: id,
        })),
      markProjectComplete: (id) =>
        set((state) => ({
          projects: updateProjectById(state.projects, id, (project) => {
            if (project.trackingMode !== "counter") {
              return project;
            }

            return {
              ...project,
              isCompleted: true,
              isProjectComplete: true,
              completedAt: new Date().toISOString(),
              activityLog: appendActivity(project, "Mark Complete"),
            };
          }),
          selectedProjectId: id,
        })),
      addPatternAsset: (input) => {
        let createdAssetId: string | null = null;

        set((state) => {
          const title = input.title.trim();
          const sourceUrl = input.sourceUrl.trim();

          if (!title || !sourceUrl) {
            return state;
          }

          const nextAsset: PatternAsset = {
            id: buildPatternAssetId(),
            title,
            type: input.type,
            sourceUrl,
            category: input.category.trim(),
            tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
            note: input.note?.trim() ?? "",
            createdAt: new Date().toISOString(),
          };

          createdAssetId = nextAsset.id;

          return {
            patternAssets: [nextAsset, ...state.patternAssets],
          };
        });

        return createdAssetId;
      },
    }),
    {
      name: "threadit-projects-store",
      version: 8,
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        draftProject: state.draftProject,
        projects: state.projects,
        patternAssets: state.patternAssets,
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
                trackingMode: normalizeStoredTrackingMode(
                  (state.draftProject as DraftProject & {
                    trackingMode?: "detailed" | "simple" | TrackingMode;
                  }).trackingMode,
                ),
                progressTargetCount: normalizeProgressTargetCount(
                  (state.draftProject as DraftProject & {
                    progressTargetCount?: number;
                    simpleTargetCount?: number;
                  }).progressTargetCount ??
                    (state.draftProject as DraftProject & {
                      progressTargetCount?: number;
                      simpleTargetCount?: number;
                    }).simpleTargetCount ??
                    20,
                ),
                patternAssetIds: sanitizePatternAssetIds(
                  (state.draftProject as DraftProject & { patternAssetIds?: string[] })
                    .patternAssetIds,
                ),
              }
            : buildDraftProject(),
          patternAssets: sanitizePatternAssets(state?.patternAssets),
          projects:
            state?.projects?.map((project) => {
              const trackingMode = normalizeStoredTrackingMode(
                (
                  project as TrackerProject & {
                    trackingMode?: "detailed" | "simple" | TrackingMode;
                  }
                ).trackingMode,
              );
              const rows = sanitizePatternRows(project.rows);
              const progressTargetCount = normalizeProgressTargetCount(
                (project as TrackerProject & {
                  progressTargetCount?: number;
                  simpleTargetCount?: number;
                }).progressTargetCount ??
                  (project as TrackerProject & {
                    progressTargetCount?: number;
                    simpleTargetCount?: number;
                  }).simpleTargetCount ??
                  0,
              );
              const patternCursor = normalizeProjectCursor(
                rows,
                project.currentRow ?? 0,
                project.currentStep ?? 0,
                project.isProjectComplete ?? false,
              );
              const progressCursor = normalizeProgressProject(
                project.currentRow ?? 0,
                progressTargetCount,
              );
              const counterCursor = normalizeCounterProject(
                (project as TrackerProject & { countValue?: number }).countValue ?? 0,
              );

              return {
                ...project,
                userId: project.userId ?? null,
                rows: trackingMode === "pattern" ? rows : [],
                structureType:
                  (project as TrackerProject & { workMode?: StructureType })
                    .structureType ??
                  (project as TrackerProject & { workMode?: StructureType }).workMode ??
                  "row",
                trackingMode,
                progressTargetCount,
                countValue:
                  trackingMode === "counter" ? counterCursor.countValue : 0,
                startDirection: project.startDirection ?? "right",
                startSide: project.startSide ?? "RS",
                currentRow:
                  trackingMode === "pattern"
                    ? patternCursor.currentRow
                    : trackingMode === "progress"
                      ? progressCursor.currentRow
                      : counterCursor.currentRow,
                currentStep:
                  trackingMode === "pattern"
                    ? patternCursor.currentStep
                    : trackingMode === "progress"
                      ? progressCursor.currentStep
                      : counterCursor.currentStep,
                isCompleted:
                  (project as TrackerProject & { isCompleted?: boolean }).isCompleted ??
                  (trackingMode === "pattern"
                    ? patternCursor.isProjectComplete
                    : trackingMode === "progress"
                      ? progressCursor.isCompleted
                      : counterCursor.isCompleted),
                completedAt:
                  (project as TrackerProject & { completedAt?: string | null }).completedAt ??
                  ((project as TrackerProject & { isCompleted?: boolean }).isCompleted === true
                    ? new Date().toISOString()
                    : null) ??
                  null,
                isProjectComplete:
                  trackingMode === "pattern"
                    ? patternCursor.isProjectComplete
                    : trackingMode === "progress"
                      ? progressCursor.isProjectComplete
                      : counterCursor.isProjectComplete,
                notes: project.notes ?? "",
                patternAssetIds: sanitizePatternAssetIds(
                  (project as TrackerProject & { patternAssetIds?: string[] })
                    .patternAssetIds,
                ),
                activityLog: sanitizeActivityLogEntries(project.activityLog),
              };
            }) ?? [],
          selectedProjectId: state?.selectedProjectId ?? null,
        } satisfies Pick<
          PatternRowsStore,
          | "currentUserId"
          | "draftProject"
          | "projects"
          | "patternAssets"
          | "selectedProjectId"
        >;
      },
    },
  ),
);
