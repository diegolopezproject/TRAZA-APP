"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, AppTab, PlanView } from "./app-state";
import { initialAppState, navigationStateEquals, rootAppState } from "./app-state";

const historyKey = "__trazaNavigationV1";
const focusAttribute = "data-navigation-focus";
const planViews = new Set<PlanView>(["menu", "saved", "placement", "create"]);

export interface AppHistoryEntry {
  version: 1;
  id: string;
  depth: number;
  navigation: AppState;
  scroll: Record<string, { top: number; left: number }>;
  focusKey: string | null;
}

type NavigationUpdate = AppState | ((current: AppState) => AppState);

function nextEntryId(): string {
  return `traza-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createAppHistoryEntry(navigation: AppState, depth = 0): AppHistoryEntry {
  return { version: 1, id: nextEntryId(), depth, navigation, scroll: {}, focusKey: null };
}

export function readAppHistoryEntry(value: unknown): AppHistoryEntry | null {
  if (!value || typeof value !== "object") return null;
  const candidate = (value as Record<string, unknown>)[historyKey];
  if (!candidate || typeof candidate !== "object") return null;
  const entry = candidate as Partial<AppHistoryEntry>;
  return entry.version === 1 && typeof entry.depth === "number" && Boolean(entry.navigation) ? entry as AppHistoryEntry : null;
}

function withHistoryEntry(entry: AppHistoryEntry): Record<string, unknown> {
  const current = window.history.state;
  const base = current && typeof current === "object" ? current as Record<string, unknown> : {};
  return { ...base, [historyKey]: entry };
}

export function navigationHash(state: AppState): string {
  if (state.tab === "trip") return state.tripEditingTransfers ? "#trip/transfers/edit" : "#trip";
  if (state.tab === "saved") {
    if (state.assignmentPlaceId) return `#saved/assignment/${encodeURIComponent(state.assignmentPlaceId)}/step/${state.assignmentStep}`;
    if (state.placeDetailId) return `#saved/place/${encodeURIComponent(state.placeDetailId)}`;
    if (state.placeEditorId) return `#saved/form/${encodeURIComponent(state.placeEditorId)}`;
    return "#saved";
  }
  if (!state.openDayId) return "#days";
  const day = `#days/${encodeURIComponent(state.openDayId)}`;
  if (state.detailActivityId) return `${day}/activity/${encodeURIComponent(state.detailActivityId)}`;
  if (state.assignmentPlaceId) return `${day}/assignment/${encodeURIComponent(state.assignmentPlaceId)}/step/${state.assignmentStep}`;
  if (state.placeDetailId) return `${day}/place/${encodeURIComponent(state.placeDetailId)}`;
  if (state.placeEditorId) return `${day}/form/${encodeURIComponent(state.placeEditorId)}`;
  if (state.planSheet) return `${day}/plan/${state.planSheet.view}${state.planSheet.placeId ? `/${encodeURIComponent(state.planSheet.placeId)}` : ""}`;
  if (state.mealActivityId) return `${day}/meal/${encodeURIComponent(state.mealActivityId)}`;
  if (state.dayMode === "organize") return `${day}/organize`;
  return day;
}

export function navigationFromHash(hash: string): AppState {
  const segments = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (segments[0] === "trip") return { ...initialAppState, tab: "trip", tripEditingTransfers: segments.slice(1).join("/") === "transfers/edit" };
  if (segments[0] === "saved") {
    const next = { ...initialAppState, tab: "saved" as const };
    if (segments[1] === "place" && segments[2]) next.placeDetailId = segments[2];
    if (segments[1] === "form" && segments[2]) next.placeEditorId = segments[2];
    if (segments[1] === "assignment" && segments[2]) {
      next.assignmentPlaceId = segments[2];
      next.assignmentStep = segments[4] === "2" ? 2 : 1;
    }
    return next;
  }
  const next = { ...initialAppState };
  if (segments[0] !== "days" || !segments[1]) return next;
  next.openDayId = segments[1];
  const dayNumber = Number(segments[1].slice(-2));
  if (Number.isFinite(dayNumber)) next.selectedDay = Math.max(0, Math.min(7, dayNumber - 6));
  if (segments[2] === "activity" && segments[3]) next.detailActivityId = segments[3];
  if (segments[2] === "assignment" && segments[3]) {
    next.assignmentPlaceId = segments[3];
    next.assignmentStep = segments[5] === "2" ? 2 : 1;
  }
  if (segments[2] === "place" && segments[3]) next.placeDetailId = segments[3];
  if (segments[2] === "form" && segments[3]) next.placeEditorId = segments[3];
  if (segments[2] === "meal" && segments[3]) next.mealActivityId = segments[3];
  if (segments[2] === "organize") next.dayMode = "organize";
  if (segments[2] === "plan" && planViews.has(segments[3] as PlanView)) {
    next.planSheet = { dayId: next.openDayId, view: segments[3] as PlanView, placeId: segments[4] };
  }
  return next;
}

export function directEntryFallback(state: AppState): AppState {
  return rootAppState(state, "journey");
}

function captureScroll(): AppHistoryEntry["scroll"] {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>("[data-navigation-scroll]")].map((element) => [element.dataset.navigationScroll ?? "", { top: element.scrollTop, left: element.scrollLeft }]).filter(([key]) => Boolean(key)));
}

function restoreEntry(entry: AppHistoryEntry) {
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    for (const [key, position] of Object.entries(entry.scroll)) {
      const element = document.querySelector<HTMLElement>(`[data-navigation-scroll="${key}"]`);
      element?.scrollTo({ top: position.top, left: position.left, behavior: "auto" });
    }
    const focusTarget = entry.focusKey ? document.querySelector<HTMLElement>(`[${focusAttribute}="${entry.focusKey}"]`) : null;
    (focusTarget ?? document.querySelector<HTMLElement>('.ds-bottom-navigation__item[aria-current="page"]'))?.focus({ preventScroll: true });
  }));
}

export function useAppNavigation() {
  const [state, setState] = useState<AppState>(initialAppState);
  const stateRef = useRef(state);
  const entryRef = useRef<AppHistoryEntry | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const apply = useCallback((next: AppState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    const existing = readAppHistoryEntry(window.history.state);
    const entry = existing ?? createAppHistoryEntry(navigationFromHash(window.location.hash));
    entryRef.current = entry;
    if (!navigationStateEquals(entry.navigation, stateRef.current)) window.requestAnimationFrame(() => apply(entry.navigation));
    if (!existing) {
      window.history.replaceState(
        withHistoryEntry(entry),
        "",
        `${window.location.pathname}${window.location.search}${navigationHash(entry.navigation)}`,
      );
    }

    const rememberTrigger = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("button, a, [tabindex]") : null;
      if (target) lastTriggerRef.current = target;
    };
    const popstate = (event: PopStateEvent) => {
      const target = readAppHistoryEntry(event.state);
      if (!target) return;
      entryRef.current = target;
      apply(target.navigation);
      restoreEntry(target);
    };
    document.addEventListener("pointerdown", rememberTrigger, true);
    window.addEventListener("popstate", popstate);
    return () => {
      document.removeEventListener("pointerdown", rememberTrigger, true);
      window.removeEventListener("popstate", popstate);
    };
  }, [apply]);

  const commit = useCallback((update: NavigationUpdate, mode: "push" | "replace") => {
    const next = typeof update === "function" ? update(stateRef.current) : update;
    if (navigationStateEquals(next, stateRef.current)) return;
    const current = entryRef.current ?? createAppHistoryEntry(stateRef.current);
    const trigger = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : lastTriggerRef.current;
    let focusKey = current.focusKey;
    if (trigger) {
      focusKey = trigger.getAttribute(focusAttribute) ?? nextEntryId();
      trigger.setAttribute(focusAttribute, focusKey);
    }
    const captured = { ...current, navigation: stateRef.current, scroll: captureScroll(), focusKey };
    window.history.replaceState(withHistoryEntry(captured), "", navigationHash(stateRef.current));
    const target = mode === "push"
      ? createAppHistoryEntry(next, captured.depth + 1)
      : { ...captured, navigation: next };
    if (mode === "push") window.history.pushState(withHistoryEntry(target), "", navigationHash(next));
    else window.history.replaceState(withHistoryEntry(target), "", navigationHash(next));
    entryRef.current = target;
    apply(next);
  }, [apply]);

  const push = useCallback((update: NavigationUpdate) => commit(update, "push"), [commit]);
  const replace = useCallback((update: NavigationUpdate) => commit(update, "replace"), [commit]);
  const back = useCallback(() => {
    const current = entryRef.current;
    if (current && current.depth > 0) window.history.back();
    else commit(directEntryFallback(stateRef.current), "replace");
  }, [commit]);
  const backSteps = useCallback((steps: number) => {
    const current = entryRef.current;
    if (current && current.depth >= steps) window.history.go(-steps);
    else commit(directEntryFallback(stateRef.current), "replace");
  }, [commit]);
  const changeTab = useCallback((tab: AppTab) => {
    if (tab !== stateRef.current.tab || stateRef.current.openDayId) push(rootAppState(stateRef.current, tab));
  }, [push]);

  return { state, push, replace, back, backSteps, changeTab };
}
