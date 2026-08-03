import type { Trip } from "./models";

export interface TripRepository {
  getTrip(): Promise<Trip>;
}
