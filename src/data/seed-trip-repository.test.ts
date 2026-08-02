import { describe, expect, it } from "vitest";
import { SeedTripRepository } from "./seed-trip-repository";

describe("SeedTripRepository", () => {
  it("maps eight days and the strategic activity levels", async () => {
    const trip = await new SeedTripRepository().getTrip();
    const friday = trip.days.find((day) => day.date === "2026-08-07");

    expect(trip.days).toHaveLength(8);
    expect(friday?.activities.map((activity) => activity.level)).toEqual([
      "anchor",
      "anchor",
      "nearby-option",
      "intention",
      "anchor",
      "nearby-option",
    ]);
  });

  it("derives safe booking summaries without private references", async () => {
    const trip = await new SeedTripRepository().getTrip();
    expect(trip.bookings.length).toBeGreaterThan(0);
    expect(JSON.stringify(trip.bookings)).not.toMatch(/confirmation|locator|reference/i);
  });

  it("enriches recognizable places with typed local media", async () => {
    const trip = await new SeedTripRepository().getTrip();
    const skyGarden = trip.days[1].activities.find((activity) => activity.title === "Sky Garden");
    const kynanceMews = trip.savedPlaces.find((place) => place.name === "Kynance Mews");

    expect(skyGarden?.media).toMatchObject({ kind: "photo", src: expect.stringContaining("sky-garden") });
    expect(kynanceMews?.media?.alt).toContain("Kynance Mews");
  });

  it("loads the 28 real saved places and calculates their media safely", async () => {
    const trip = await new SeedTripRepository().getTrip();
    expect(trip.savedPlaces).toHaveLength(28);
    expect(trip.savedPlaces.map((place) => place.name)).toContain("Shakespeare's Globe");
    expect(new Set(trip.savedPlaces.filter((place) => place.media).map((place) => place.media?.src)).size).toBe(6);
    expect(trip.savedPlaces.find((place) => place.name === "Hard Rock Cafe")?.tags).toContain("Cabina de One Direction");
  });

  it("contains the confirmed itinerary corrections", async () => {
    const trip = await new SeedTripRepository().getTrip();
    const activity = (date: string, title: string) => trip.days.find((day) => day.date === date)?.activities.find((item) => item.title === title);
    expect(activity("2026-08-06", "Flight Seville to London Gatwick")?.endTime).toBe("13:35");
    expect(activity("2026-08-07", "Sky Garden")).toMatchObject({ startTime: "08:30", endTime: "09:30", status: "confirmed" });
    expect(activity("2026-08-07", "The Hunger Games")?.startTime).toBe("19:00");
    expect(activity("2026-08-08", "Natural History Museum")).toMatchObject({ startTime: "15:30", level: "anchor", status: "confirmed" });
    expect(activity("2026-08-09", "Wicked")?.startTime).toBe("14:30");
    expect(trip.bookings).toHaveLength(12);
  });

  it("gives each day a distinct theme and never restores the generic church asset", async () => {
    const trip = await new SeedTripRepository().getTrip();
    expect(new Set(trip.days.map((day) => day.visualTheme)).size).toBe(8);
    expect(JSON.stringify(trip)).not.toMatch(/church|iglesia/i);
  });
});
