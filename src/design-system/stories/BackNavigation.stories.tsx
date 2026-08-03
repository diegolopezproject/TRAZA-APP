import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function BackScenario({ current, previous, fallback = false }: { current: string; previous: string; fallback?: boolean }) {
  return <main className="ds-back-story" data-audit-overlay="safe-zone"><section className="ds-back-story__under"><span>Anterior</span><strong>{previous}</strong></section><section className="ds-back-story__current"><i aria-hidden="true" /><span>Contexto actual</span><h2>{current}</h2><p>Swipe desde la zona marcada o Back/X → {previous}</p>{fallback ? <small>Entrada directa · replaceState a #days</small> : <small>pushState coordinado · scroll y foco preservados</small>}</section></main>;
}

const meta = { title: "Patterns/BackNavigation/Iteration 09", parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile402" } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const DayDetail: Story = { render: () => <BackScenario current="Día 7 abierto" previous="Días · 7 seleccionado" /> };
export const ActivityDetail: Story = { render: () => <BackScenario current="Sky Garden" previous="Día 7 · mismo scroll" /> };
export const PlaceDetail: Story = { render: () => <BackScenario current="M&M's London" previous="Guardados · mismo scroll" /> };
export const ModalFlow: Story = { render: () => <BackScenario current="Asignación · paso 2" previous="Asignación · paso 1" /> };
export const DirectEntryFallback: Story = { render: () => <BackScenario current="Detalle abierto directamente" previous="Días" fallback /> };
