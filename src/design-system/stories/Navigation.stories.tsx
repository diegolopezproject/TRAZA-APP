import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomNavigation } from "@/design-system";
import { HeartIcon, JourneyIcon, TicketIcon } from "@/components/icons";

const items = [
  { id: "journey", label: "Días", icon: <JourneyIcon /> },
  { id: "saved", label: "Guardados", icon: <HeartIcon /> },
  { id: "trip", label: "Viaje", icon: <TicketIcon /> },
] as const;

function NavigationStory({ active, className = "", longLabels = false }: { active: typeof items[number]["id"]; className?: string; longLabels?: boolean }) {
  const storyItems = longLabels ? [
    { ...items[0], label: "Todos los días" },
    { ...items[1], label: "Lugares guardados" },
    { ...items[2], label: "Datos del viaje" },
  ] : items;
  return <main className="ds-navigation-story"><span>Day card</span><div className="ds-navigation-story__indicator" aria-label="Indicador de posición"><i /><i className="is-active" /><i /><i /><i /><i /><i /><i /></div><BottomNavigation className={className} items={storyItems} active={active} onChange={() => undefined} label="Secciones de TRAZA" /></main>;
}

const meta = { title: "Core/BottomNavigation/Iteration 09", parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile402" } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const DaysActive: Story = { render: () => <NavigationStory active="journey" /> };
export const SavedActive: Story = { render: () => <NavigationStory active="saved" /> };
export const TripActive: Story = { render: () => <NavigationStory active="trip" /> };
export const Mobile360: Story = { parameters: { viewport: { defaultViewport: "mobile360" } }, render: () => <NavigationStory active="journey" /> };
export const AndroidSafeBottom: Story = { globals: { safeArea: "iphone" }, render: () => <NavigationStory active="saved" /> };
export const LongLabels: Story = { render: () => <NavigationStory active="saved" longLabels /> };
export const Pressed: Story = { render: () => <NavigationStory active="journey" className="is-preview-pressed" /> };
export const Focus: Story = { render: () => <NavigationStory active="journey" />, play: async ({ canvasElement }) => { canvasElement.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus(); } };
export const ReducedMotion: Story = { globals: { motion: "reduced" }, render: () => <NavigationStory active="trip" /> };
