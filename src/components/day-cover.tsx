import type { Day } from "@/domain/models";
import type { ReactNode } from "react";
import { coverTitleEs, dayEditorial, es, weekdayEs } from "@/content/es";
import { dayNumber } from "@/lib/format";
import { DayMotif } from "./day-motif";
import { ArrowIcon } from "./icons";
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

  return <DesignSystemDayCover dayNumber={number} weekday={weekday} sequenceLabel={`Día ${index + 1} de 8`} eyebrow={editorial.eyebrow} title={title} status={confirmed ? es.journey.anchors(confirmed) : es.journey.open} motif={<DayMotif day={day} />} theme={day.visualTheme} artPosition="back" active={active} onOpen={onOpen} openLabel={es.journey.coverAria(weekday, number, title)} openText={es.journey.openDay} openIcon={<ArrowIcon />} progress={progress} />;
}
