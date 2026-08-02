import type {
  MealSelection,
  Place,
  PlaceAssignment,
  TransferPlan,
  Trip,
  UserPlan,
} from "@/domain/models";

export const LOCAL_TRIP_SCHEMA_VERSION = 3;
export const LOCAL_TRIP_STORAGE_KEY = "electric-london:trip:v3";

export interface LocalTripState {
  schemaVersion: typeof LOCAL_TRIP_SCHEMA_VERSION;
  places: Place[];
  assignments: PlaceAssignment[];
  mealSelections: MealSelection[];
  userPlans: UserPlan[];
  transfers: TransferPlan[];
  updatedAt: string;
}

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createInitialLocalState(seed: Trip): LocalTripState {
  return {
    schemaVersion: LOCAL_TRIP_SCHEMA_VERSION,
    places: clone(seed.savedPlaces),
    assignments: [],
    mealSelections: [],
    userPlans: [],
    transfers: clone(seed.transfers),
    updatedAt: new Date(0).toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function migrate(value: unknown, seed: Trip): LocalTripState | null {
  if (!isRecord(value)) return null;

  const version = Number(value.schemaVersion ?? 1);
  if (version > LOCAL_TRIP_SCHEMA_VERSION) return null;

  const initial = createInitialLocalState(seed);
  const places = Array.isArray(value.places) ? value.places as Place[] : initial.places;
  const assignments = Array.isArray(value.assignments)
    ? value.assignments as PlaceAssignment[]
    : isRecord(value.assignments)
      ? Object.entries(value.assignments).map(([placeId, dayId]) => ({
          placeId,
          dayId: String(dayId),
          section: "anytime" as const,
          level: "nearby-option" as const,
        }))
      : [];

  return {
    schemaVersion: LOCAL_TRIP_SCHEMA_VERSION,
    places,
    assignments,
    mealSelections: Array.isArray(value.mealSelections) ? value.mealSelections as MealSelection[] : [],
    userPlans: Array.isArray(value.userPlans) ? value.userPlans as UserPlan[] : [],
    transfers: Array.isArray(value.transfers) ? value.transfers as TransferPlan[] : initial.transfers,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
  };
}

export class LocalTripRepository {
  constructor(
    private readonly seed: Trip,
    private readonly storage: StoragePort,
  ) {}

  load(): LocalTripState {
    const raw = this.storage.getItem(LOCAL_TRIP_STORAGE_KEY);
    if (!raw) return createInitialLocalState(this.seed);
    try {
      return migrate(JSON.parse(raw) as unknown, this.seed) ?? createInitialLocalState(this.seed);
    } catch {
      return createInitialLocalState(this.seed);
    }
  }

  save(state: LocalTripState): LocalTripState {
    const next: LocalTripState = { ...state, schemaVersion: LOCAL_TRIP_SCHEMA_VERSION, updatedAt: new Date().toISOString() };
    this.storage.setItem(LOCAL_TRIP_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  reset(): LocalTripState {
    this.storage.removeItem(LOCAL_TRIP_STORAGE_KEY);
    return createInitialLocalState(this.seed);
  }
}

export function duplicateVisibleMediaSources(places: Place[]): string[] {
  const counts = new Map<string, number>();
  for (const place of places) {
    const media = place.media;
    if (!media || media.sharedFallback) continue;
    counts.set(media.src, (counts.get(media.src) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([src]) => src);
}
