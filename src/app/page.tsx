import { TripApp } from "@/components/trip-app";
import { SeedTripRepository } from "@/data/seed-trip-repository";

export default async function Home() {
  const trip = await new SeedTripRepository().getTrip();
  return <TripApp trip={trip} />;
}
