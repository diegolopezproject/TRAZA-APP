import type { Day } from "@/domain/models";
import { es, weekdayEs } from "@/content/es";
import { dayNumber } from "@/lib/format";
import { DayCover } from "./day-cover";
import { DayDeck } from "@/design-system";

interface DayCarouselProps { days: Day[]; selectedIndex: number; onSelect: (index: number) => void; onOpen: (day: Day) => void; }

export function DayCarousel({ days, selectedIndex, onSelect, onOpen }: DayCarouselProps) {
  return <section className="journey-view" aria-label={es.journey.label}>
    <DayDeck total={days.length} currentIndex={selectedIndex} label={es.journey.label} onIndexChange={onSelect} onOpenCurrent={() => onOpen(days[selectedIndex])} renderItem={(index, active) => <DayCover day={days[index]} index={index} active={active} onOpen={() => onOpen(days[index])} />} />
    <p className="sr-only" aria-live="polite">{es.journey.currentAnnouncement(weekdayEs(days[selectedIndex]), dayNumber(days[selectedIndex].date))}</p>
  </section>;
}
