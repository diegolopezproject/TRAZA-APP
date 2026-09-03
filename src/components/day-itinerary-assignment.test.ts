import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import type { ActivityLevel, Day, DaySection, Place } from "@/domain/models";
import { SeedTripRepository } from "@/data/seed-trip-repository";
import {
  assignmentPlacementChoice,
  DayItinerary,
  groupAssignedItemsByPlacement,
} from "./day-itinerary";
import type { AssignedItem } from "./day-itinerary";

const importedPlace: Place = {
  id: "imported:018f47f5-4f43-7c8f-8f47-2b9ef863f483",
  name: "The Mad Hatter Hotel",
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

function assignedItem(
  place: Place,
  section: DaySection,
  level: ActivityLevel = section === "anytime" ? "nearby-option" : "intention",
): AssignedItem {
  return {
    place,
    assignment: {
      placeId: place.id,
      dayId: "2026-08-07",
      section,
      level,
    },
  };
}

function placeWithName(name: string): Place {
  return { ...importedPlace, id: `${importedPlace.id}:${name}`, name };
}

function sectionMarkup(markup: string, labelledBy: string): string {
  return markup.match(new RegExp(`<section[^>]*aria-labelledby="${labelledBy}"[^>]*>([\\s\\S]*?)<\\/section>`, "u"))?.[1] ?? "";
}

describe("DayItinerary assigned place placement", () => {
  let day: Day;

  beforeAll(async () => {
    const trip = await new SeedTripRepository().getTrip();
    day = trip.days.find((candidate) => candidate.id === "2026-08-07")!;
  });

  function renderAssignments(assignedItems: AssignedItem[]): string {
    return renderToStaticMarkup(createElement(DayItinerary, {
      day,
      dayIndex: 1,
      onClose: () => undefined,
      onOpenActivity: () => undefined,
      assignedItems,
      onEditAssignment: () => undefined,
      onOpenPlace: () => undefined,
      onAddPlan: () => undefined,
      onEditPlan: () => undefined,
      onOpenMeal: () => undefined,
      placements: [],
      onSavePlacements: () => undefined,
      onOrganizeNotice: () => undefined,
      organizing: false,
      onStartOrganizing: () => undefined,
      onFinishOrganizing: () => undefined,
    }));
  }

  it("maps the five existing UI choices without collapsing nearby and later", () => {
    const grouped = groupAssignedItemsByPlacement([
      assignedItem(placeWithName("Morning"), "morning"),
      assignedItem(placeWithName("Afternoon"), "afternoon"),
      assignedItem(placeWithName("Evening"), "evening"),
      assignedItem(placeWithName("Nearby"), "anytime", "nearby-option"),
      assignedItem(placeWithName("Later"), "anytime", "intention"),
    ]);

    expect(assignmentPlacementChoice(grouped.morning[0].assignment)).toBe("morning");
    expect(assignmentPlacementChoice(grouped.afternoon[0].assignment)).toBe("afternoon");
    expect(assignmentPlacementChoice(grouped.evening[0].assignment)).toBe("evening");
    expect(assignmentPlacementChoice(grouped.nearby[0].assignment)).toBe("nearby");
    expect(assignmentPlacementChoice(grouped.later[0].assignment)).toBe("later");
  });

  it("renders Mañana inside the existing morning section", () => {
    const markup = renderAssignments([assignedItem(importedPlace, "morning")]);

    expect(sectionMarkup(markup, "section-0")).toContain(importedPlace.name);
    expect(sectionMarkup(markup, "assigned-title")).not.toContain(importedPlace.name);
  });

  it("renders Mediodía / tarde inside the temporal section, not nearby", () => {
    const markup = renderAssignments([assignedItem(importedPlace, "afternoon")]);

    expect(sectionMarkup(markup, "section-1")).toContain(importedPlace.name);
    expect(sectionMarkup(markup, "assigned-title")).not.toContain(importedPlace.name);
  });

  it("renders Noche inside the existing evening section", () => {
    const markup = renderAssignments([assignedItem(importedPlace, "evening")]);

    expect(sectionMarkup(markup, "section-2")).toContain(importedPlace.name);
    expect(sectionMarkup(markup, "assigned-title")).not.toContain(importedPlace.name);
  });

  it("keeps Opciones cercanas in the existing nearby section", () => {
    const markup = renderAssignments([assignedItem(importedPlace, "anytime", "nearby-option")]);
    const nearby = sectionMarkup(markup, "assigned-title");

    expect(nearby).toContain(importedPlace.name);
    expect(nearby).toContain("Opción cercana");
  });

  it("keeps Decidir después distinct while preserving its current day destination", () => {
    const markup = renderAssignments([assignedItem(importedPlace, "anytime", "intention")]);
    const nearby = sectionMarkup(markup, "assigned-title");

    expect(nearby).toContain(importedPlace.name);
    expect(nearby).toContain("Plan flexible");
    expect(nearby).not.toContain("Opción cercana");
  });

  it("uses the same rendered section contract for a local place", () => {
    const markup = renderAssignments([assignedItem(localPlace, "afternoon")]);

    expect(sectionMarkup(markup, "section-1")).toContain(localPlace.name);
    expect(sectionMarkup(markup, "assigned-title")).not.toContain(localPlace.name);
  });
});
