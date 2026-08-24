import type { Day } from "@/domain/models";
import type { ReactNode } from "react";
import { coverTitleEs, dayEditorial, es, weekdayEs } from "@/content/es";
import { dayNumber } from "@/lib/format";
import { DayMotif } from "./day-motif";
import { ChevronIcon } from "./icons";
import { DayCover as DesignSystemDayCover } from "@/design-system";

interface DayCoverProps {
  day: Day;
  index: number;
  active: boolean;
  progress: ReactNode;
  onOpen: () => void;
}

export function DayCover({ day, index, active, progress, onOpen }: DayCoverProps) {
  const number = dayNumber(day.date);
  const confirmed = day.activities.filter((activity) => activity.status === "confirmed").length;
  const weekday = weekdayEs(day);
  const title = coverTitleEs(day);
  const editorial = dayEditorial[day.id];
  const route = editorial.eyebrow.replaceAll(" → ", " · ").replaceAll(" / ", " · ");
  const showEntryHint = day.id === "2026-08-07" && active;

  return <DesignSystemDayCover dayNumber={number} weekday={weekday} sequenceLabel={`${index + 1} / 8`} eyebrow={route} title={title} status={confirmed ? es.journey.anchors(confirmed) : es.journey.open} motif={<DayMotif day={day} cover />} theme={day.visualTheme} active={active} onOpen={onOpen} openLabel={`${es.journey.openDay}: ${es.journey.coverAria(weekday, number, title)}`} openText={es.journey.openDay} openIcon={<ChevronIcon className="ds-icon-chevron-up" />} openComposition="centered" entryHint={showEntryHint} progress={progress} />;
}
