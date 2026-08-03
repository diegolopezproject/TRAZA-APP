import seed from "../../03_SEED_DATA.json";
import type {
  Activity,
  ActivityLevel,
  ActivityStatus,
  Booking,
  Day,
  Place,
  TravelSegment,
  TransferPlan,
  Trip,
} from "@/domain/models";
import type { TripRepository } from "@/domain/trip-repository";
import { slugify } from "@/lib/format";
import { activityMedia, fallbackPlaceMedia, placeMedia } from "./media-catalog";

type Seed = typeof seed;
type SeedActivity = Seed["days"][number]["activities"][number];

const activityLevels = new Set<ActivityLevel>(["anchor", "intention", "nearby-option"]);
const activityStatuses = new Set<ActivityStatus>([
  "confirmed", "planned", "unplanned", "flexible", "saved", "researching", "evaluating",
]);

function toLevel(value: string): ActivityLevel {
  if (activityLevels.has(value as ActivityLevel)) return value as ActivityLevel;
  throw new Error(`Unsupported activity level: ${value}`);
}

function toStatus(value: string): ActivityStatus {
  if (activityStatuses.has(value as ActivityStatus)) return value as ActivityStatus;
  throw new Error(`Unsupported activity status: ${value}`);
}

function mapActivity(activity: SeedActivity, dayId: string, index: number): Activity {
  return {
    ...activity,
    id: `${dayId}-${slugify(activity.title)}-${index}`,
    level: toLevel(activity.level),
    status: toStatus(activity.status),
    media: activityMedia[activity.title],
  };
}

function mapDays(days: Seed["days"]): Day[] {
  return days.map((day) => {
    const id = day.date;
    return {
      ...day,
      id,
      activities: day.activities.map((activity, index) =>
        mapActivity(activity, id, index),
      ),
    };
  });
}

function mapPlaces(places: Seed["savedPlaces"]): Place[] {
  return places.map((place, index) => ({
    ...place,
    id: `${slugify(place.name)}-${index}`,
    status: toStatus(place.status),
    tags: "tags" in place && Array.isArray(place.tags) ? [...place.tags] : [],
    media: placeMedia[place.name] ?? fallbackPlaceMedia(place.name),
    mapsQuery: place.mapsQuery ?? `${place.name}, London, UK`,
  }));
}

function deriveBookings(days: Day[]): Booking[] {
  return days.flatMap((day) =>
    day.activities
      .filter((activity) => activity.level === "anchor" && activity.status === "confirmed")
      .map((activity) => ({
        id: `booking-${activity.id}`,
        title: activity.title,
        date: day.date,
        time: activity.startTime,
        status:
          activity.timeNeedsVerification || activity.status !== "confirmed"
            ? "verify"
            : "confirmed",
      })),
  );
}

const travelSegments: TravelSegment[] = [
  {
    id: "outbound-flight",
    kind: "flight",
    origin: "Sevilla · SVQ",
    destination: "Londres · LGW",
    date: "2026-08-06",
    startTime: "11:50",
    endTime: "13:35",
    service: "BA2649",
  },
  {
    id: "return-flight",
    kind: "flight",
    origin: "Londres · LHR",
    destination: "Sevilla · SVQ",
    date: "2026-08-13",
    startTime: "15:10",
    endTime: "19:00",
    service: "VY6023",
  },
];

const transfers: TransferPlan[] = [
  {
    id: "arrival-transfer",
    label: "arrival",
    origin: "Gatwick",
    destination: "Ibis Styles London Ealing",
    date: "2026-08-06",
    timeLabel: "Después de aterrizar",
    notes: "Método pendiente de confirmar.",
    mapsQuery: "Gatwick Airport to Ibis Styles London Ealing",
  },
  {
    id: "return-transfer",
    label: "return",
    origin: "Ibis Styles London Ealing",
    destination: "Heathrow",
    date: "2026-08-13",
    timeLabel: "Hora objetivo pendiente",
    notes: "Método pendiente de confirmar.",
    mapsQuery: "Ibis Styles London Ealing to Heathrow Airport",
  },
];

export class SeedTripRepository implements TripRepository {
  async getTrip(): Promise<Trip> {
    const days = mapDays(seed.days);
    return {
      ...seed.trip,
      travellers: [...seed.trip.travellers],
      days,
      savedPlaces: mapPlaces(seed.savedPlaces),
      bookings: deriveBookings(days),
      travelSegments,
      transfers,
    };
  }
}
