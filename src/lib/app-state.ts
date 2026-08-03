export type AppTab = "journey" | "saved" | "trip";
export type AssignmentStep = 1 | 2;
export type DayMode = "view" | "organize";
export type PlanView = "menu" | "saved" | "placement" | "create";

export interface PlanSheetNavigation {
  dayId: string;
  planId?: string;
  view: PlanView;
  placeId?: string;
}

export interface AppState {
  tab: AppTab;
  selectedDay: number;
  openDayId: string | null;
  dayMode: DayMode;
  detailActivityId: string | null;
  assignmentPlaceId: string | null;
  assignmentStep: AssignmentStep;
  placeEditorId: "new" | string | null;
  placeDetailId: string | null;
  planSheet: PlanSheetNavigation | null;
  mealActivityId: string | null;
  savedFilter: string;
  tripEditingTransfers: boolean;
}

export const initialAppState: AppState = {
  tab: "journey",
  selectedDay: 1,
  openDayId: null,
  dayMode: "view",
  detailActivityId: null,
  assignmentPlaceId: null,
  assignmentStep: 1,
  placeEditorId: null,
  placeDetailId: null,
  planSheet: null,
  mealActivityId: null,
  savedFilter: "all",
  tripEditingTransfers: false,
};

export function rootAppState(state: AppState, tab: AppTab = "journey"): AppState {
  return {
    ...initialAppState,
    tab,
    selectedDay: state.selectedDay,
    savedFilter: state.savedFilter,
  };
}

export function navigationStateEquals(left: AppState, right: AppState): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
