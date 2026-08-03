import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DayDeck } from "@/design-system";

const days = [
  { id: "06", color: "orange", title: "Primera tarde" },
  { id: "07", color: "sky", title: "La City desde las alturas" },
  { id: "08", color: "pink", title: "Notting Hill a todo color" },
  { id: "09", color: "lime", title: "El centro se vuelve verde" },
];

function DeckScenario({ current = 1, offsetX = 0, pressed = false, settling = false }: { current?: number; offsetX?: number; pressed?: boolean; settling?: boolean }) {
  return <main className="ds-deck-story"><DayDeck total={days.length} currentIndex={current} label="Días de Londres" getItemKey={(index) => days[index].id} diagnosticOffset={{ x: offsetX, y: 0 }} diagnosticPressed={pressed} diagnosticSettling={settling} onIndexChange={() => undefined} onOpenCurrent={() => undefined} renderItem={(index, active) => <article className={`ds-deck-story-card is-${days[index].color}`}><span>{days[index].id}</span><h2>{days[index].title}</h2><small>{active ? "Activa · color real" : "Vecina · color real"}</small></article>} /></main>;
}

const meta = { title: "Patterns/DayDeck/Iteration 09 motion", parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile402" } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { render: () => <DeckScenario /> };
export const Drag30Percent: Story = { render: () => <DeckScenario offsetX={-108} pressed /> };
export const CompletedSwipe: Story = { render: () => <DeckScenario current={2} settling /> };
export const CancelledSwipe: Story = { render: () => <DeckScenario offsetX={-32} settling /> };
export const FirstDayResistance: Story = { render: () => <DeckScenario current={0} offsetX={24} pressed /> };
export const LastDayResistance: Story = { render: () => <DeckScenario current={3} offsetX={-24} pressed /> };
export const ReducedMotion: Story = { globals: { motion: "reduced" }, render: () => <DeckScenario current={2} /> };
export const NoDarkFlash: Story = { render: () => <DeckScenario offsetX={-108} pressed /> };
