import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomNavigation } from "@/design-system";

const items = [{ id: "journey", label: "Días", icon: "◉" }, { id: "saved", label: "Guardados", icon: "♡" }, { id: "trip", label: "Viaje", icon: "✦" }] as const;
const meta = { title: "Core/BottomNavigation/Ink comparison", parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile402" } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Variants: Story = { render: () => <div className="ds-navigation-comparison"><section><h2>A · Lime sin cápsula · seleccionada</h2><BottomNavigation items={items} active="journey" onChange={() => undefined} label="Navegación A" variant="ink" /></section><section><h2>B · Cápsula Ink elevada</h2><BottomNavigation items={items} active="journey" onChange={() => undefined} label="Navegación B" variant="elevated" /></section></div> };
