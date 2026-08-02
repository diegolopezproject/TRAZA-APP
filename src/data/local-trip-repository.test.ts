import { describe, expect, it } from "vitest";
import type { StoragePort } from "./local-trip-repository";
import {
  LOCAL_TRIP_STORAGE_KEY,
  LocalTripRepository,
  duplicateVisibleMediaSources,
} from "./local-trip-repository";
import { SeedTripRepository } from "./seed-trip-repository";

class MemoryStorage implements StoragePort {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe("LocalTripRepository", () => {
  it("persists added, edited and removed places across reloads", async () => {
    const seed = await new SeedTripRepository().getTrip();
    const storage = new MemoryStorage();
    const repository = new LocalTripRepository(seed, storage);
    const initial = repository.load();
    const added = { ...initial.places[0], id: "local-coffee", name: "Café local", userCreated: true as const };
    repository.save({ ...initial, places: [...initial.places.slice(1), added] });

    const reloaded = new LocalTripRepository(seed, storage).load();
    expect(reloaded.places).toHaveLength(28);
    expect(reloaded.places.some((place) => place.id === "local-coffee")).toBe(true);
    expect(reloaded.places.some((place) => place.id === initial.places[0].id)).toBe(false);
  });

  it("migrates assignment records and falls back on invalid data", async () => {
    const seed = await new SeedTripRepository().getTrip();
    const storage = new MemoryStorage();
    storage.setItem(LOCAL_TRIP_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, assignments: { place: "2026-08-10" } }));
    expect(new LocalTripRepository(seed, storage).load().assignments[0]).toMatchObject({ placeId: "place", dayId: "2026-08-10" });
    storage.setItem(LOCAL_TRIP_STORAGE_KEY, "{invalid");
    expect(new LocalTripRepository(seed, storage).load().places).toHaveLength(28);
  });

  it("rejects accidental duplicate media sources unless marked as fallback", async () => {
    const seed = await new SeedTripRepository().getTrip();
    expect(duplicateVisibleMediaSources(seed.savedPlaces)).toEqual([]);
  });

  it("persists assignments, meals, moved plans and transfers after reload", async () => {
    const seed = await new SeedTripRepository().getTrip();
    const storage = new MemoryStorage();
    const repository = new LocalTripRepository(seed, storage);
    const initial = repository.load();
    const restaurant = initial.places.find((place) => place.name === "Al Dente")!;
    const plan = {
      id: "local-plan-test", title: "Ruta propia", type: "tour", level: "intention" as const,
      status: "flexible" as const, dayId: "2026-08-11", section: "afternoon" as const, userCreated: true as const,
    };
    repository.save({
      ...initial,
      assignments: [{ placeId: restaurant.id, dayId: "2026-08-08", section: "afternoon", level: "nearby-option" }],
      mealSelections: [{ mealSlotId: "lunch", dayId: "2026-08-08", sourcePlaceId: restaurant.id }],
      userPlans: [{ ...plan, dayId: "2026-08-12" }],
      placements: [{ activityId: "2026-08-12-local-plan-test", dayId: "2026-08-12", section: "evening", order: 0 }],
      transfers: initial.transfers.map((transfer) => transfer.id === "arrival-transfer" ? { ...transfer, transportType: "Tren" } : transfer),
    });
    const reloaded = new LocalTripRepository(seed, storage).load();
    expect(reloaded.assignments[0].dayId).toBe("2026-08-08");
    expect(reloaded.mealSelections[0].sourcePlaceId).toBe(restaurant.id);
    expect(reloaded.places.some((place) => place.id === restaurant.id)).toBe(true);
    expect(reloaded.userPlans[0].dayId).toBe("2026-08-12");
    expect(reloaded.placements[0].section).toBe("evening");
    expect(reloaded.transfers[0].transportType).toBe("Tren");
  });
});
