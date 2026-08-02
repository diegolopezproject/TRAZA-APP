"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { Activity, ActivityLevel, ActivityPlacement, DaySection, Place, PlaceAssignment, TransferPlan, Trip, UserPlan } from "@/domain/models";
import { activityTitleEs, es } from "@/content/es";
import { createInitialLocalState, LocalTripRepository } from "@/data/local-trip-repository";
import type { LocalTripState } from "@/data/local-trip-repository";
import { formatSpanishDate } from "@/lib/format";
import { appReducer, initialAppState } from "@/lib/app-state";
import { ActivityDetail } from "./activity-detail";
import { AssignmentSheet } from "./assignment-sheet";
import { BottomNav } from "./bottom-nav";
import { DayCarousel } from "./day-carousel";
import { DayItinerary } from "./day-itinerary";
import { MealPickerSheet } from "./meal-picker-sheet";
import { PlaceFormSheet } from "./place-form-sheet";
import { PlaceDetailSheet } from "./place-detail-sheet";
import { PlanFormSheet } from "./plan-form-sheet";
import { SavedView } from "./saved-view";
import { TripView } from "./trip-view";

interface TripAppProps { trip: Trip; }
interface Notice { message: string; undo?: () => void; }
interface PlanSheetState { dayId: string; planId?: string; }

export function TripApp({ trip }: TripAppProps) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [local, setLocal] = useState<LocalTripState>(() => createInitialLocalState(trip));
  const repositoryRef = useRef<LocalTripRepository | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [placeEditor, setPlaceEditor] = useState<"new" | string | null>(null);
  const [placeDetailId, setPlaceDetailId] = useState<string | null>(null);
  const [planSheet, setPlanSheet] = useState<PlanSheetState | null>(null);
  const [mealActivityId, setMealActivityId] = useState<string | null>(null);

  useEffect(() => {
    const repository = new LocalTripRepository(trip, window.localStorage);
    repositoryRef.current = repository;
    const frame = window.requestAnimationFrame(() => setLocal(repository.load()));
    return () => window.cancelAnimationFrame(frame);
  }, [trip]);

  const effectiveTrip = useMemo<Trip>(() => {
    const days = trip.days.map((day) => {
      const activities = day.activities.map((activity) => {
        const meal = local.mealSelections.find((selection) => selection.mealSlotId === activity.id);
        const place = meal ? local.places.find((item) => item.id === meal.sourcePlaceId) : undefined;
        return place ? {
          ...activity,
          displayTitle: `${activityTitleEs(activity)} · ${place.name}`,
          sourcePlaceId: place.id,
          mealSlotId: activity.id,
          area: place.area ?? activity.area,
          mapsQuery: place.mapsQuery ?? activity.mapsQuery,
          media: place.media,
        } : activity;
      });
      const combined = [...activities, ...local.userPlans.filter((plan) => plan.dayId === day.id)];
      const scoped = local.placements.filter((placement) => placement.dayId === day.id);
      const ordered = [...combined].sort((a, b) => (scoped.find((item) => item.activityId === a.id)?.order ?? 999) - (scoped.find((item) => item.activityId === b.id)?.order ?? 999));
      const withSections = ordered.map((activity) => {
        const placement = scoped.find((item) => item.activityId === activity.id);
        return placement ? { ...activity, section: placement.section } : activity;
      });
      return { ...day, activities: withSections };
    });
    return { ...trip, days, savedPlaces: local.places, transfers: local.transfers };
  }, [local, trip]);

  const openDay = effectiveTrip.days.find((day) => day.id === state.openDayId) ?? null;
  const openDayIndex = openDay ? effectiveTrip.days.findIndex((day) => day.id === openDay.id) : -1;
  const detailActivity = openDay?.activities.find((activity) => activity.id === state.detailActivityId) ?? null;
  const assignmentPlace = local.places.find((place) => place.id === state.assignmentPlaceId) ?? null;
  const assignment = local.assignments.find((item) => item.placeId === state.assignmentPlaceId);
  const assignedItems = openDay ? local.assignments.filter((item) => item.dayId === openDay.id).flatMap((item) => {
    const place = local.places.find((candidate) => candidate.id === item.placeId);
    return place ? [{ place, assignment: item }] : [];
  }) : [];
  const assignmentsByPlace = Object.fromEntries(local.assignments.map((item) => [item.placeId, item.dayId]));
  const nearbyPlaces = local.places.filter((place) => ["GAIL's Bakery London Bridge", "Kova Patisserie Aldgate East", "Reflection Garden"].includes(place.name));
  const editedPlace = placeEditor && placeEditor !== "new" ? local.places.find((place) => place.id === placeEditor) : undefined;
  const detailPlace = local.places.find((place) => place.id === placeDetailId);
  const planDay = planSheet ? effectiveTrip.days.find((day) => day.id === planSheet.dayId) : undefined;
  const editedPlan = planSheet?.planId ? local.userPlans.find((plan) => plan.id === planSheet.planId) : undefined;
  const mealActivity = openDay?.activities.find((activity) => activity.id === mealActivityId) ?? null;
  const mealSelection = mealActivity ? local.mealSelections.find((selection) => selection.mealSlotId === mealActivity.id) : undefined;

  function persist(next: LocalTripState) {
    setLocal(repositoryRef.current?.save(next) ?? next);
  }

  function persistWithUndo(next: LocalTripState, message: string) {
    const previous = local;
    persist(next);
    setNotice({ message, undo: () => { persist(previous); setNotice({ message: "Cambio deshecho" }); } });
  }

  useEffect(() => {
    document.body.classList.toggle("is-layer-open", Boolean(openDay || assignmentPlace || placeEditor || placeDetailId || planSheet || mealActivity));
    return () => document.body.classList.remove("is-layer-open");
  }, [assignmentPlace, mealActivity, openDay, placeDetailId, placeEditor, planSheet]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openActivity(activity: Activity) {
    if (activity.title === "Sky Garden") dispatch({ type: "OPEN_DETAIL", activityId: activity.id });
  }

  const selectDay = useCallback((index: number) => dispatch({ type: "SELECT_DAY", index }), []);

  function assignPlace(placeId: string, dayId: string, section: DaySection, level: ActivityLevel) {
    const place = local.places.find((item) => item.id === placeId);
    const nextAssignment: PlaceAssignment = { placeId, dayId, section, level };
    const next = { ...local, assignments: [...local.assignments.filter((item) => item.placeId !== placeId), nextAssignment] };
    persistWithUndo(next, place ? es.assignment.success(place.name, formatSpanishDate(dayId)) : es.forms.saved);
    dispatch({ type: "CLOSE_ASSIGNMENT" });
  }

  function removeAssignment(placeId: string) {
    persistWithUndo({ ...local, assignments: local.assignments.filter((item) => item.placeId !== placeId) }, es.forms.removed);
    dispatch({ type: "CLOSE_ASSIGNMENT" });
  }

  function savePlace(place: Place) {
    const exists = local.places.some((item) => item.id === place.id);
    persistWithUndo({ ...local, places: exists ? local.places.map((item) => item.id === place.id ? place : item) : [...local.places, place] }, es.forms.saved);
    setPlaceEditor(null);
  }

  function deletePlace(place: Place) {
    persistWithUndo({
      ...local,
      places: local.places.filter((item) => item.id !== place.id),
      assignments: local.assignments.filter((item) => item.placeId !== place.id),
      mealSelections: local.mealSelections.filter((item) => item.sourcePlaceId !== place.id),
    }, `${place.name}: ${es.forms.removed.toLowerCase()}`);
    setPlaceEditor(null);
  }

  function savePlan(plan: UserPlan) {
    const exists = local.userPlans.some((item) => item.id === plan.id);
    persistWithUndo({ ...local, userPlans: exists ? local.userPlans.map((item) => item.id === plan.id ? plan : item) : [...local.userPlans, plan] }, es.forms.saved);
    setPlanSheet(null);
  }

  function deletePlan(plan: UserPlan) {
    persistWithUndo({ ...local, userPlans: local.userPlans.filter((item) => item.id !== plan.id) }, es.forms.removed);
    setPlanSheet(null);
  }

  function chooseSavedForDay(placeId: string, section: DaySection) {
    if (!planSheet) return;
    assignPlace(placeId, planSheet.dayId, section, "nearby-option");
    setPlanSheet(null);
  }

  function chooseRestaurant(placeId: string) {
    if (!openDay || !mealActivity) return;
    const nextSelection = { mealSlotId: mealActivity.id, dayId: openDay.id, sourcePlaceId: placeId };
    persistWithUndo({ ...local, mealSelections: [...local.mealSelections.filter((item) => item.mealSlotId !== mealActivity.id), nextSelection] }, "Restaurante vinculado al itinerario");
    setMealActivityId(null);
  }

  function removeRestaurant() {
    if (!mealActivity) return;
    persistWithUndo({ ...local, mealSelections: local.mealSelections.filter((item) => item.mealSlotId !== mealActivity.id) }, "Restaurante retirado del itinerario");
    setMealActivityId(null);
  }

  function saveTransfers(transfers: TransferPlan[]) {
    persistWithUndo({ ...local, transfers }, "Traslados actualizados");
  }

  function savePlacements(placements: ActivityPlacement[]) {
    const otherDays = local.placements.filter((placement) => placement.dayId !== openDay?.id);
    persist({ ...local, placements: [...otherDays, ...placements] });
  }

  function resetLocalData() {
    const reset = repositoryRef.current?.reset() ?? createInitialLocalState(trip);
    setLocal(reset);
    setNotice({ message: "Datos iniciales restaurados" });
  }

  return (
    <LayoutGroup>
      <main className={`app-shell app-shell--${state.tab}`}>
        {state.tab === "journey" ? <DayCarousel days={effectiveTrip.days} selectedIndex={state.selectedDay} onSelect={selectDay} onOpen={(day) => dispatch({ type: "OPEN_DAY", dayId: day.id })} /> : null}
        {state.tab === "saved" ? <SavedView places={local.places} assignments={assignmentsByPlace} onAssignRequest={(placeId) => dispatch({ type: "OPEN_ASSIGNMENT", placeId })} onAddPlace={() => setPlaceEditor("new")} onEditPlace={setPlaceEditor} onReset={resetLocalData} /> : null}
        {state.tab === "trip" ? <TripView trip={effectiveTrip} onSaveTransfers={saveTransfers} /> : null}

        <BottomNav active={state.tab} onChange={(tab) => dispatch({ type: "CHANGE_TAB", tab })} />

        <AnimatePresence>{openDay ? <DayItinerary key={openDay.id} day={openDay} dayIndex={openDayIndex} onClose={() => dispatch({ type: "CLOSE_DAY" })} onOpenActivity={openActivity} assignedItems={assignedItems} onEditAssignment={(placeId) => dispatch({ type: "OPEN_ASSIGNMENT", placeId })} onOpenPlace={setPlaceDetailId} onAddPlan={() => setPlanSheet({ dayId: openDay.id })} onEditPlan={(activity) => setPlanSheet({ dayId: openDay.id, planId: activity.id })} onOpenMeal={(activity) => setMealActivityId(activity.id)} placements={local.placements} onSavePlacements={savePlacements} onOrganizeNotice={(message) => setNotice({ message })} /> : null}</AnimatePresence>
        <AnimatePresence>{detailActivity ? <ActivityDetail key={detailActivity.id} activity={detailActivity} nearbyPlaces={nearbyPlaces} onBack={() => dispatch({ type: "CLOSE_DETAIL" })} /> : null}</AnimatePresence>
        <AnimatePresence>{assignmentPlace ? <AssignmentSheet key={assignmentPlace.id} place={assignmentPlace} days={effectiveTrip.days} assignment={assignment} onAssign={(dayId, section, level) => assignPlace(assignmentPlace.id, dayId, section, level)} onRemove={() => removeAssignment(assignmentPlace.id)} onClose={() => dispatch({ type: "CLOSE_ASSIGNMENT" })} /> : null}</AnimatePresence>
        <AnimatePresence>{placeEditor ? <PlaceFormSheet key={placeEditor} place={editedPlace} onSave={savePlace} onDelete={editedPlace ? deletePlace : undefined} onClose={() => setPlaceEditor(null)} /> : null}</AnimatePresence>
        <AnimatePresence>{detailPlace ? <PlaceDetailSheet key={detailPlace.id} place={detailPlace} onClose={() => setPlaceDetailId(null)} /> : null}</AnimatePresence>
        <AnimatePresence>{planDay ? <PlanFormSheet key={`${planDay.id}-${editedPlan?.id ?? "new"}`} day={planDay} days={effectiveTrip.days} places={local.places} plan={editedPlan} onChoosePlace={chooseSavedForDay} onSave={savePlan} onDelete={editedPlan ? deletePlan : undefined} onClose={() => setPlanSheet(null)} /> : null}</AnimatePresence>
        <AnimatePresence>{openDay && mealActivity ? <MealPickerSheet key={mealActivity.id} day={openDay} meal={mealActivity} places={local.places} selectedPlaceId={mealSelection?.sourcePlaceId} onSelect={chooseRestaurant} onRemove={removeRestaurant} onClose={() => setMealActivityId(null)} /> : null}</AnimatePresence>

        <AnimatePresence>{notice ? <motion.aside className="assignment-toast" role="status" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}><span>{notice.message}</span>{notice.undo ? <button type="button" onClick={notice.undo}>{es.forms.undo}</button> : null}</motion.aside> : null}</AnimatePresence>
      </main>
    </LayoutGroup>
  );
}
