import { describe, expect, it } from "vitest";
import type { DaySection, Place } from "@/domain/models";
import { groupAssignedItemsBySection } from "./day-itinerary";
import type { AssignedItem } from "./day-itinerary";

const importedPlace: Place = {
  id: "imported:018f47f5-4f43-7c8f-8f47-2b9ef863f483",
  name: "Hotel Riu Plaza London Victoria",
  category: "attraction",
  status: "saved",
  tags: [],
  source: "imported-google",
  importedRecordId: "018f47f5-4f43-7c8f-8f47-2b9ef863f483",
};

const localPlace: Place = {
  id: "local-place",
  name: "Local place",
  category: "neighbourhood",
  status: "saved",
  tags: [],
};

function assignedItem(place: Place, section: DaySection): AssignedItem {
  return {
    place,
    assignment: {
      placeId: place.id,
      dayId: "2026-08-07",
      section,
      level: section === "anytime" ? "nearby-option" : "intention",
    },
  };
}

describe("DayItinerary assigned place placement", () => {
  it("resolves an imported morning assignment into morning and not nearby", () => {
    const grouped = groupAssignedItemsBySection([assignedItem(importedPlace, "morning")]);

    expect(grouped.morning.map(({ place }) => place.id)).toEqual([importedPlace.id]);
    expect(grouped.anytime).toEqual([]);
  });

  it("preserves another scheduled section for an imported place", () => {
    const grouped = groupAssignedItemsBySection([assignedItem(importedPlace, "evening")]);

    expect(grouped.evening.map(({ place }) => place.id)).toEqual([importedPlace.id]);
    expect(grouped.morning).toEqual([]);
  });

  it("keeps an explicitly flexible imported assignment in nearby", () => {
    const grouped = groupAssignedItemsBySection([assignedItem(importedPlace, "anytime")]);

    expect(grouped.anytime.map(({ place }) => place.id)).toEqual([importedPlace.id]);
    expect(grouped.morning).toEqual([]);
    expect(grouped.afternoon).toEqual([]);
    expect(grouped.evening).toEqual([]);
  });

  it("uses the same section contract for local places", () => {
    const grouped = groupAssignedItemsBySection([
      assignedItem(localPlace, "afternoon"),
      assignedItem(importedPlace, "morning"),
    ]);

    expect(grouped.afternoon.map(({ place }) => place.id)).toEqual([localPlace.id]);
    expect(grouped.morning.map(({ place }) => place.id)).toEqual([importedPlace.id]);
  });
});
