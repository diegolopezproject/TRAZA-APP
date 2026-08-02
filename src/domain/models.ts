export type ActivityLevel = "anchor" | "intention" | "nearby-option";
export type ActivityStatus =
  | "confirmed"
  | "planned"
  | "unplanned"
  | "flexible"
  | "saved"
  | "researching"
  | "evaluating";

export type DaySection = "morning" | "afternoon" | "evening" | "anytime";

export interface MediaAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  focalPoint?: string;
  source?: string;
  sourceUrl?: string;
  author?: string;
  license?: string;
  kind: "photo" | "illustration" | "graphic" | "generated-editorial" | "fallback";
  editorial?: boolean;
  generatedAt?: string;
  sharedFallback?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  displayTitle?: string;
  type: string;
  level: ActivityLevel;
  status: ActivityStatus;
  startTime?: string;
  endTime?: string;
  timeLabel?: string;
  timeNeedsVerification?: boolean;
  partySize?: number;
  area?: string;
  venue?: string;
  mapsQuery?: string;
  notes?: string;
  media?: MediaAsset;
  section?: DaySection;
  sourcePlaceId?: string;
  mealSlotId?: string;
  userCreated?: boolean;
}

export interface MealSlot extends Activity {
  type: "meal";
  level: "nearby-option";
}

export interface Day {
  id: string;
  date: string;
  weekday: string;
  coverTitle: string;
  visualTheme: string;
  activities: Activity[];
}

export interface Place {
  id: string;
  name: string;
  category: string;
  status: ActivityStatus;
  area?: string;
  tags: string[];
  notes?: string;
  media?: MediaAsset;
  mapsQuery?: string;
  userCreated?: boolean;
}

export interface PlaceAssignment {
  placeId: string;
  dayId: string;
  section: DaySection;
  level: ActivityLevel;
}

export interface MealSelection {
  mealSlotId: string;
  dayId: string;
  sourcePlaceId: string;
  scheduledTime?: string;
}

export interface UserPlan extends Activity {
  dayId: string;
  section: DaySection;
  userCreated: true;
}

export interface ActivityPlacement {
  activityId: string;
  dayId: string;
  section: DaySection;
  order: number;
}

export interface Booking {
  id: string;
  title: string;
  date: string;
  time?: string;
  status: "confirmed" | "verify";
}

export interface TravelSegment {
  id: string;
  kind: "flight" | "transfer";
  origin: string;
  destination: string;
  date: string;
  startTime?: string;
  endTime?: string;
  service?: string;
}

export interface TransferPlan {
  id: string;
  label: "arrival" | "return";
  origin: string;
  destination: string;
  date: string;
  timeLabel?: string;
  transportType?: string;
  station?: string;
  ticket?: string;
  plannedTime?: string;
  reference?: string;
  notes?: string;
  mapsQuery?: string;
}

export interface Hotel {
  name: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  timeNotes: string;
  mapsQuery: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travellers: string[];
  hotel: Hotel;
  days: Day[];
  savedPlaces: Place[];
  bookings: Booking[];
  travelSegments: TravelSegment[];
  transfers: TransferPlan[];
}
