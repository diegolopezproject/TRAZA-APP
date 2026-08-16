import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DayCover } from "@/design-system";
import { ArrowIcon } from "@/components/icons";
import { DayMotif } from "@/components/day-motif";
import { dayEditorial, es } from "@/content/es";
import type { Day } from "@/domain/models";

const days = [
  { id: "2026-08-06", date: "2026-08-06", weekday: "Jueves", coverTitle: es.coverTitles["2026-08-06"], visualTheme: "orange-night", activities: [] },
  { id: "2026-08-07", date: "2026-08-07", weekday: "Viernes", coverTitle: es.coverTitles["2026-08-07"], visualTheme: "sky-lime-orange", activities: [] },
  { id: "2026-08-08", date: "2026-08-08", weekday: "Sábado", coverTitle: es.coverTitles["2026-08-08"], visualTheme: "pink-orange", activities: [] },
  { id: "2026-08-09", date: "2026-08-09", weekday: "Domingo", coverTitle: es.coverTitles["2026-08-09"], visualTheme: "violet-lime", activities: [] },
  { id: "2026-08-10", date: "2026-08-10", weekday: "Lunes", coverTitle: es.coverTitles["2026-08-10"], visualTheme: "orange-black", activities: [] },
  { id: "2026-08-11", date: "2026-08-11", weekday: "Martes", coverTitle: es.coverTitles["2026-08-11"], visualTheme: "blue-pink", activities: [] },
  { id: "2026-08-12", date: "2026-08-12", weekday: "Miércoles", coverTitle: es.coverTitles["2026-08-12"], visualTheme: "illustrated-open-day", activities: [] },
  { id: "2026-08-13", date: "2026-08-13", weekday: "Jueves", coverTitle: es.coverTitles["2026-08-13"], visualTheme: "sky-white", activities: [] },
] satisfies Day[];

function RealDayCover({ index = 1, debugBounds = false }: { index?: number; debugBounds?: boolean }) {
  const day = days[index];
  const number = day.date.slice(-2);
  const progress = <span className="ds-day-cover__progress" aria-hidden="true">{days.map((item, segment) => <i key={item.id} className={segment === index ? "is-current" : ""} />)}</span>;
  return <DayCover dayNumber={number} weekday={day.weekday} sequenceLabel={`Día ${index + 1} de 8`} eyebrow={dayEditorial[day.id].eyebrow} title={day.coverTitle} status={index === 3 || index === 5 || index === 6 ? es.journey.open : es.journey.anchors(index === 1 ? 2 : 1)} theme={day.visualTheme} artPosition="back" motif={<DayMotif day={day} />} openText={es.journey.openDay} openIcon={<ArrowIcon />} progress={progress} debugBounds={debugBounds} />;
}

const meta = {
  title: "Patterns/DayCover/Iteration 11",
  parameters: { layout: "centered", viewport: { defaultViewport: "mobile390" } },
  decorators: [(Story) => <div className="ds-story-cover-frame"><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Day07: Story = { render: () => <RealDayCover index={1} /> };
export const Mobile360: Story = { parameters: { viewport: { defaultViewport: "mobile360" } }, render: () => <RealDayCover index={1} /> };
export const Mobile390: Story = { parameters: { viewport: { defaultViewport: "mobile390" } }, render: () => <RealDayCover index={3} /> };
export const Mobile430: Story = { parameters: { viewport: { defaultViewport: "mobile430" } }, render: () => <RealDayCover index={4} /> };
export const DebugBounds: Story = { render: () => <RealDayCover index={4} debugBounds /> };
export const AllEightChapters: Story = { render: () => <div className="ds-story-cover-grid">{days.map((day, index) => <div className="ds-story-cover-frame" key={day.id}><RealDayCover index={index} /></div>)}</div>, parameters: { layout: "fullscreen" } };
