import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DayCover } from "@/design-system";

function SkyGardenMotif() {
  return <svg viewBox="0 0 320 360" className="ds-atmospheric-motif" aria-hidden="true"><path className="sky-garden" d="M48 308C60 242 64 126 103 42c38 44 54 102 50 164l-12 102Z" /><path className="sky-cut" d="M82 286c13-68 13-139 25-202 24 51 28 128 15 202Z" /><path className="canary" d="M194 304V150h29v154m11 0V112h34v192m10 0V174h26v130" /><path className="orange" d="M182 144h128v13H182zm-12 26h108v10H170z" /><circle className="lime" cx="274" cy="84" r="22" /></svg>;
}

const meta = { title: "Expression/DayCover/Atmospheric", parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile402" } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const shared = { dayNumber: "07", weekday: "Viernes", sequenceLabel: "Día 2 de 8", eyebrow: "Sky Garden → City → Canary Wharf", title: "La City desde las alturas. Canary Wharf al anochecer.", status: "3 planes confirmados", theme: "sky-lime-orange", motif: <SkyGardenMotif /> } as const;
export const FlatVsAtmospheric: Story = { render: () => <div className="ds-atmospheric-comparison"><div><span>Flat</span><DayCover {...shared} atmosphere="flat" /></div><div><span>Atmospheric · piloto</span><DayCover {...shared} atmosphere="atmospheric" /></div></div> };
