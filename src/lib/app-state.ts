export type AppTab = "journey" | "saved" | "trip";

export interface AppState {
  tab: AppTab;
  selectedDay: number;
  openDayId: string | null;
  detailActivityId: string | null;
  assignmentPlaceId: string | null;
}

export type AppAction =
  | { type: "SELECT_DAY"; index: number }
  | { type: "OPEN_DAY"; dayId: string }
  | { type: "CLOSE_DAY" }
  | { type: "OPEN_DETAIL"; activityId: string }
  | { type: "CLOSE_DETAIL" }
  | { type: "OPEN_ASSIGNMENT"; placeId: string }
  | { type: "CLOSE_ASSIGNMENT" }
  | { type: "CHANGE_TAB"; tab: AppTab };

export const initialAppState: AppState = {
  tab: "journey",
  selectedDay: 1,
  openDayId: null,
  detailActivityId: null,
  assignmentPlaceId: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SELECT_DAY":
      return state.openDayId === null
        ? { ...state, selectedDay: action.index }
        : state;
    case "OPEN_DAY":
      return { ...state, tab: "journey", openDayId: action.dayId };
    case "CLOSE_DAY":
      return { ...state, openDayId: null, detailActivityId: null };
    case "OPEN_DETAIL":
      return state.openDayId
        ? { ...state, detailActivityId: action.activityId }
        : state;
    case "CLOSE_DETAIL":
      return { ...state, detailActivityId: null };
    case "OPEN_ASSIGNMENT":
      return { ...state, assignmentPlaceId: action.placeId };
    case "CLOSE_ASSIGNMENT":
      return { ...state, assignmentPlaceId: null };
    case "CHANGE_TAB":
      return {
        ...state,
        tab: action.tab,
        openDayId: null,
        detailActivityId: null,
        assignmentPlaceId: null,
      };
  }
}
