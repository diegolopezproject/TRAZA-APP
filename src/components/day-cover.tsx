import type { Day } from "@/domain/models";
import { coverTitleEs, dayEditorial, es, weekdayEs } from "@/content/es";
import { dayNumber } from "@/lib/format";
import { DayMotif } from "./day-motif";
import { DayCover as DesignSystemDayCover, type DayCoverArtPosition } from "@/design-system";

interface DayCoverProps {
  day: Day;
  index: number;
  active: boolean;
  onOpen: () => void;
}

export function DayCover({ day, index, active, onOpen }: DayCoverProps) {
  const number = dayNumber(day.date);
  const confirmed = day.activities.filter((activity) => activity.status === "confirmed").length;
  const weekday = weekdayEs(day);
  const title = coverTitleEs(day);
  const editorial = dayEditorial[day.id];

  const artPositions: Record<string, DayCoverArtPosition> = { "2026-08-06": "left", "2026-08-07": "back", "2026-08-08": "top", "2026-08-10": "left" };
  return <DesignSystemDayCover dayNumber={number} weekday={weekday} sequenceLabel={`Día ${index + 1} de 8`} eyebrow={editorial.eyebrow} title={title} status={confirmed ? es.journey.anchors(confirmed) : es.journey.open} motif={<DayMotif day={day} />} theme={day.visualTheme} artPosition={artPositions[day.id] ?? "back"} active={active} onOpen={onOpen} openLabel={es.journey.coverAria(weekday, number, title)} />;
}
