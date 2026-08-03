"use client";

import { useMemo, useState } from "react";
import type { Activity, Day, Place } from "@/domain/models";
import { es } from "@/content/es";
import { MapIcon, PlusIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { MobileSheet } from "./mobile-sheet";

interface MealPickerSheetProps {
  day: Day;
  meal: Activity;
  places: Place[];
  selectedPlaceId?: string;
  onSelect: (placeId: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

function targetAreas(day: Day, meal: Activity): string[] {
  if (day.id === "2026-08-07") return meal.title === "Dinner" ? ["Canary Wharf"] : ["City of London", "London Bridge", "Borough Market", "Aldgate East"];
  if (day.id === "2026-08-08") return ["Notting Hill", "South Kensington"];
  if (day.id === "2026-08-10" && meal.title === "Lunch") return ["Camden"];
  return day.activities.map((activity) => activity.area).filter((area): area is string => Boolean(area));
}

export function MealPickerSheet({ day, meal, places, selectedPlaceId, onSelect, onRemove, onClose }: MealPickerSheetProps) {
  const [showAll, setShowAll] = useState(false);
  const restaurants = useMemo(() => places.filter((place) => place.category === "food-drink"), [places]);
  const targets = targetAreas(day, meal);
  const suggested = restaurants.filter((place) => {
    const area = place.area?.toLowerCase();
    return area ? targets.some((target) => area.includes(target.toLowerCase()) || target.toLowerCase().includes(area)) : false;
  });
  const visible = showAll || suggested.length === 0 ? restaurants : suggested;

  return (
    <MobileSheet title={es.forms.chooseRestaurant} kicker={`${meal.title === "Dinner" ? "Cena" : "Comida"} / ${day.date.slice(-2)} AGO`} closeLabel={es.forms.close} onClose={onClose}>
      <div className="picker-heading"><p>{showAll ? `${restaurants.length} lugares para comer y beber` : es.forms.suggested}</p><button type="button" onClick={() => setShowAll((value) => !value)}>{showAll ? es.forms.suggested : es.forms.allRestaurants}</button></div>
      <div className="restaurant-picker-list">
        {visible.map((place) => <button className={selectedPlaceId === place.id ? "is-selected" : ""} type="button" key={place.id} onClick={() => onSelect(place.id)}>{place.media ? <MediaFrame media={place.media} sizes="76px" /> : <span className="mini-fallback">{place.name.slice(0, 2).toUpperCase()}</span>}<span><strong>{place.name}</strong><small><MapIcon /> {place.area ?? "Londres"}</small><em>{place.tags.slice(0, 2).join(" · ") || "Comer y beber"}</em></span><PlusIcon /></button>)}
      </div>
      {selectedPlaceId ? <button className="danger-action" type="button" onClick={onRemove}>{es.day.removeMeal}</button> : null}
    </MobileSheet>
  );
}
