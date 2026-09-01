"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { Activity, ActivityLevel, ActivityPlacement, DaySection, Place, PlaceAssignment, TransferPlan, Trip, UserPlan } from "@/domain/models";
import type { ImportedPlaceViewModel } from "@/domain/place-import";
import { consumeImportResultUrl, IMPORT_RESULT_MESSAGES } from "@/domain/import-result";
import { mergeHybridPlaces } from "@/domain/hybrid-places";
import { activityTitleEs, es } from "@/content/es";
import { createInitialLocalState, LocalTripRepository, removeLocalReferences } from "@/data/local-trip-repository";
import type { LocalTripState } from "@/data/local-trip-repository";
import { formatSpanishDate } from "@/lib/format";
import { useAppNavigation } from "@/lib/use-app-navigation";
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
import { AppShell } from "./app-shell";
import { motionDuration, motionEase } from "@/lib/motion";
import { ImportCategorySheet } from "./import-category-sheet";

interface TripAppProps { trip: Trip; importedPlaces: readonly ImportedPlaceViewModel[]; }
interface Notice { message: string; undo?: () => void; }

export function TripApp({ trip, importedPlaces }: TripAppProps) {
  const navigation = useAppNavigation();
  const { state } = navigation;
  const [local, setLocal] = useState<LocalTripState>(() => createInitialLocalState(trip));
  const repositoryRef = useRef<LocalTripRepository | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [imported, setImported] = useState<readonly ImportedPlaceViewModel[]>(importedPlaces);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [deletingImportedId, setDeletingImportedId] = useState<string | null>(null);

  useEffect(() => {
    const repository = new LocalTripRepository(trip, window.localStorage);
    repositoryRef.current = repository;
    const frame = window.requestAnimationFrame(() => setLocal(repository.load()));
    return () => window.cancelAnimationFrame(frame);
  }, [trip]);

  const combinedPlaces = useMemo<Place[]>(
    () => mergeHybridPlaces(local.places, imported),
    [imported, local.places],
  );

  const effectiveTrip = useMemo<Trip>(() => {
    const days = trip.days.map((day) => {
      const activities = day.activities.map((activity) => {
        const meal = local.mealSelections.find((selection) => selection.mealSlotId === activity.id);
        const place = meal ? combinedPlaces.find((item) => item.id === meal.sourcePlaceId) : undefined;
        return place ? {
          ...activity,
          displayTitle: `${activityTitleEs(activity)} · ${place.name}`,
          sourcePlaceId: place.id,
          mealSlotId: activity.id,
          area: place.area ?? activity.area,
          mapsQuery: place.mapsQuery ?? activity.mapsQuery,
          mapsDestination: place.mapsDestination ?? activity.mapsDestination,
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
    return { ...trip, days, savedPlaces: combinedPlaces, transfers: local.transfers };
  }, [combinedPlaces, local, trip]);

  const openDay = effectiveTrip.days.find((day) => day.id === state.openDayId) ?? null;
  const openDayIndex = openDay ? effectiveTrip.days.findIndex((day) => day.id === openDay.id) : -1;
  const detailActivity = openDay?.activities.find((activity) => activity.id === state.detailActivityId) ?? null;
  const assignmentPlace = combinedPlaces.find((place) => place.id === state.assignmentPlaceId) ?? null;
  const assignment = local.assignments.find((item) => item.placeId === state.assignmentPlaceId);
  const assignedItems = openDay ? local.assignments.filter((item) => item.dayId === openDay.id).flatMap((item) => {
    const place = combinedPlaces.find((candidate) => candidate.id === item.placeId);
    return place ? [{ place, assignment: item }] : [];
  }) : [];
  const assignmentsByPlace = Object.fromEntries(local.assignments.map((item) => [item.placeId, item.dayId]));
  const nearbyPlaces = local.places.filter((place) => ["GAIL's Bakery London Bridge", "Kova Patisserie Aldgate East", "Reflection Garden"].includes(place.name));
  const editedPlace = state.placeEditorId && state.placeEditorId !== "new" ? local.places.find((place) => place.id === state.placeEditorId) : undefined;
  const detailPlace = combinedPlaces.find((place) => place.id === state.placeDetailId);
  const planDay = state.planSheet ? effectiveTrip.days.find((day) => day.id === state.planSheet?.dayId) : undefined;
  const editedPlan = state.planSheet?.planId ? local.userPlans.find((plan) => plan.id === state.planSheet?.planId) : undefined;
  const mealActivity = openDay?.activities.find((activity) => activity.id === state.mealActivityId) ?? null;
  const mealSelection = mealActivity ? local.mealSelections.find((selection) => selection.mealSlotId === mealActivity.id) : undefined;

  useEffect(() => {
    const consumed = consumeImportResultUrl(window.location.href);
    if (!consumed) return;
    window.history.replaceState(window.history.state, "", consumed.cleanedUrl);
    let active = true;
    window.queueMicrotask(() => {
      if (!active) return;
      if (consumed.result === "needs-category") {
        setCategorySheetOpen(true);
      } else {
        setNotice({ message: IMPORT_RESULT_MESSAGES[consumed.result] });
      }
    });
    return () => { active = false; };
  }, []);

  function persist(next: LocalTripState) {
    setLocal(repositoryRef.current?.save(next) ?? next);
  }

  function persistWithUndo(next: LocalTripState, message: string) {
    const previous = local;
    persist(next);
    setNotice({ message, undo: () => { persist(previous); setNotice({ message: "Cambio deshecho" }); } });
  }

  useEffect(() => {
    document.body.classList.toggle("is-layer-open", Boolean(openDay || assignmentPlace || state.placeEditorId || state.placeDetailId || state.planSheet || mealActivity || categorySheetOpen));
    return () => document.body.classList.remove("is-layer-open");
  }, [assignmentPlace, categorySheetOpen, mealActivity, openDay, state.placeDetailId, state.placeEditorId, state.planSheet]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openActivity(activity: Activity) {
    if (activity.title === "Sky Garden") navigation.push((current) => ({ ...current, detailActivityId: activity.id }));
  }

  function selectDay(index: number) {
    if (!state.openDayId) navigation.replace((current) => ({ ...current, selectedDay: index }));
  }

  function assignPlace(placeId: string, dayId: string, section: DaySection, level: ActivityLevel) {
    const place = combinedPlaces.find((item) => item.id === placeId);
    const nextAssignment: PlaceAssignment = { placeId, dayId, section, level };
    const next = { ...local, assignments: [...local.assignments.filter((item) => item.placeId !== placeId), nextAssignment] };
    persistWithUndo(next, place ? es.assignment.success(place.name, formatSpanishDate(dayId)) : es.forms.saved);
    navigation.backSteps(state.assignmentStep);
  }

  function removeAssignment(placeId: string) {
    persistWithUndo({ ...local, assignments: local.assignments.filter((item) => item.placeId !== placeId) }, es.forms.removed);
    navigation.backSteps(state.assignmentStep);
  }

  function savePlace(place: Place) {
    const exists = local.places.some((item) => item.id === place.id);
    persistWithUndo({ ...local, places: exists ? local.places.map((item) => item.id === place.id ? place : item) : [...local.places, place] }, es.forms.saved);
    navigation.back();
  }

  function deletePlace(place: Place) {
    persistWithUndo({
      ...local,
      places: local.places.filter((item) => item.id !== place.id),
      assignments: local.assignments.filter((item) => item.placeId !== place.id),
      mealSelections: local.mealSelections.filter((item) => item.sourcePlaceId !== place.id),
    }, `${place.name}: ${es.forms.removed.toLowerCase()}`);
    navigation.back();
  }

  async function deleteImportedPlace(place: Place) {
    if (!place.importedRecordId || deletingImportedId) return;
    setDeletingImportedId(place.importedRecordId);
    try {
      const response = await fetch(
        `/api/imported-places/${encodeURIComponent(place.importedRecordId)}`,
        { method: "DELETE", headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw new Error("delete-failed");
      persist(removeLocalReferences(local, place.id));
      setImported((items) => items.filter((item) => item.recordId !== place.importedRecordId));
      setNotice({ message: `${place.name}: ${es.forms.removed.toLowerCase()}` });
      navigation.back();
    } catch {
      setNotice({ message: "No hemos podido eliminar este sitio." });
    } finally {
      setDeletingImportedId(null);
    }
  }

  function cancelCategorySelection() {
    setCategorySheetOpen(false);
    void fetch("/api/imported-places/finalize", {
      method: "DELETE",
      headers: { Accept: "application/json" },
      keepalive: true,
    });
  }

  function savePlan(plan: UserPlan) {
    const exists = local.userPlans.some((item) => item.id === plan.id);
    persistWithUndo({ ...local, userPlans: exists ? local.userPlans.map((item) => item.id === plan.id ? plan : item) : [...local.userPlans, plan] }, es.forms.saved);
    navigation.backSteps(state.planSheet?.planId ? 1 : state.planSheet?.view === "create" ? 2 : 1);
  }

  function deletePlan(plan: UserPlan) {
    persistWithUndo({ ...local, userPlans: local.userPlans.filter((item) => item.id !== plan.id) }, es.forms.removed);
    navigation.backSteps(state.planSheet?.planId ? 1 : state.planSheet?.view === "create" ? 2 : 1);
  }

  function chooseSavedForDay(placeId: string, section: DaySection) {
    if (!state.planSheet) return;
    const place = combinedPlaces.find((item) => item.id === placeId);
    const nextAssignment: PlaceAssignment = { placeId, dayId: state.planSheet.dayId, section, level: "nearby-option" };
    persistWithUndo({ ...local, assignments: [...local.assignments.filter((item) => item.placeId !== placeId), nextAssignment] }, place ? es.assignment.success(place.name, formatSpanishDate(state.planSheet.dayId)) : es.forms.saved);
    navigation.backSteps(state.planSheet.view === "placement" ? 3 : 1);
  }

  function chooseRestaurant(placeId: string) {
    if (!openDay || !mealActivity) return;
    const nextSelection = { mealSlotId: mealActivity.id, dayId: openDay.id, sourcePlaceId: placeId };
    persistWithUndo({ ...local, mealSelections: [...local.mealSelections.filter((item) => item.mealSlotId !== mealActivity.id), nextSelection] }, "Restaurante vinculado al itinerario");
    navigation.back();
  }

  function removeRestaurant() {
    if (!mealActivity) return;
    persistWithUndo({ ...local, mealSelections: local.mealSelections.filter((item) => item.mealSlotId !== mealActivity.id) }, "Restaurante retirado del itinerario");
    navigation.back();
  }

  function saveTransfers(transfers: TransferPlan[]) {
    persistWithUndo({ ...local, transfers }, "Traslados actualizados");
    navigation.back();
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
      <AppShell activeTab={state.tab} journeyTheme={effectiveTrip.days[state.selectedDay]?.visualTheme}>
        {state.tab === "journey" ? <DayCarousel days={effectiveTrip.days} selectedIndex={state.selectedDay} onSelect={selectDay} onOpen={(day) => navigation.push((current) => ({ ...current, tab: "journey", openDayId: day.id, dayMode: "view", detailActivityId: null, assignmentPlaceId: null, placeEditorId: null, placeDetailId: null, planSheet: null, mealActivityId: null }))} /> : null}
        {state.tab === "saved" ? <SavedView places={combinedPlaces} assignments={assignmentsByPlace} filter={state.savedFilter} onFilterChange={(filter) => navigation.replace((current) => ({ ...current, savedFilter: filter }))} onAssignRequest={(placeId) => navigation.push((current) => ({ ...current, assignmentPlaceId: placeId, assignmentStep: 1 }))} onAddPlace={() => navigation.push((current) => ({ ...current, placeEditorId: "new" }))} onEditPlace={(placeId) => navigation.push((current) => combinedPlaces.find((place) => place.id === placeId)?.source === "imported-google" ? { ...current, placeDetailId: placeId } : { ...current, placeEditorId: placeId })} onOpenPlace={(placeDetailId) => navigation.push((current) => ({ ...current, placeDetailId }))} onReset={resetLocalData} /> : null}
        {state.tab === "trip" ? <TripView trip={effectiveTrip} editingTransfers={state.tripEditingTransfers} onStartTransferEditing={() => navigation.push((current) => ({ ...current, tripEditingTransfers: true }))} onSaveTransfers={saveTransfers} /> : null}

        <BottomNav active={state.tab} onChange={navigation.changeTab} />

        <AnimatePresence>{openDay ? <DayItinerary key={openDay.id} day={openDay} dayIndex={openDayIndex} onClose={navigation.back} onOpenActivity={openActivity} assignedItems={assignedItems} onEditAssignment={(placeId) => navigation.push((current) => ({ ...current, assignmentPlaceId: placeId, assignmentStep: 1 }))} onOpenPlace={(placeDetailId) => navigation.push((current) => ({ ...current, placeDetailId }))} onAddPlan={() => navigation.push((current) => ({ ...current, planSheet: { dayId: openDay.id, view: "menu" } }))} onEditPlan={(activity) => navigation.push((current) => ({ ...current, planSheet: { dayId: openDay.id, planId: activity.id, view: "create" } }))} onOpenMeal={(activity) => navigation.push((current) => ({ ...current, mealActivityId: activity.id }))} placements={local.placements} onSavePlacements={savePlacements} onOrganizeNotice={(message) => setNotice({ message })} organizing={state.dayMode === "organize"} onStartOrganizing={() => navigation.push((current) => ({ ...current, dayMode: "organize" }))} onFinishOrganizing={navigation.back} /> : null}</AnimatePresence>
        <AnimatePresence>{detailActivity ? <ActivityDetail key={detailActivity.id} activity={detailActivity} nearbyPlaces={nearbyPlaces} onBack={navigation.back} /> : null}</AnimatePresence>
        <AnimatePresence>{assignmentPlace ? <AssignmentSheet key={assignmentPlace.id} place={assignmentPlace} days={effectiveTrip.days} assignment={assignment} step={state.assignmentStep} onStepChange={(assignmentStep) => navigation.push((current) => ({ ...current, assignmentStep }))} onAssign={(dayId, section, level) => assignPlace(assignmentPlace.id, dayId, section, level)} onRemove={() => removeAssignment(assignmentPlace.id)} onClose={navigation.back} /> : null}</AnimatePresence>
        <AnimatePresence>{state.placeEditorId ? <PlaceFormSheet key={state.placeEditorId} place={editedPlace} onSave={savePlace} onDelete={editedPlace ? deletePlace : undefined} onClose={navigation.back} /> : null}</AnimatePresence>
        <AnimatePresence>{detailPlace ? <PlaceDetailSheet key={detailPlace.id} place={detailPlace} onClose={navigation.back} onDelete={detailPlace.source === "imported-google" ? () => void deleteImportedPlace(detailPlace) : undefined} deleting={deletingImportedId === detailPlace.importedRecordId} /> : null}</AnimatePresence>
        <AnimatePresence>{planDay && state.planSheet ? <PlanFormSheet key={`${planDay.id}-${editedPlan?.id ?? "new"}`} day={planDay} days={effectiveTrip.days} places={combinedPlaces} plan={editedPlan} view={state.planSheet.view} placementPlaceId={state.planSheet.placeId} onNavigate={(view, placeId) => navigation.push((current) => ({ ...current, planSheet: current.planSheet ? { ...current.planSheet, view, placeId } : null }))} onChoosePlace={chooseSavedForDay} onSave={savePlan} onDelete={editedPlan ? deletePlan : undefined} onClose={navigation.back} /> : null}</AnimatePresence>
        <AnimatePresence>{openDay && mealActivity ? <MealPickerSheet key={mealActivity.id} day={openDay} meal={mealActivity} places={combinedPlaces} selectedPlaceId={mealSelection?.sourcePlaceId} onSelect={chooseRestaurant} onRemove={removeRestaurant} onClose={navigation.back} /> : null}</AnimatePresence>
        <AnimatePresence>{categorySheetOpen ? <ImportCategorySheet key="import-category" onCancel={cancelCategorySelection} /> : null}</AnimatePresence>

        <AnimatePresence>{notice ? <motion.aside className="assignment-toast" role="status" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: motionDuration.standard, ease: motionEase }}><span>{notice.message}</span>{notice.undo ? <button type="button" onClick={notice.undo}>{es.forms.undo}</button> : null}</motion.aside> : null}</AnimatePresence>
      </AppShell>
    </LayoutGroup>
  );
}
