import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArchBlock, BuildingBlock, DayCover, DomeBlock, EditorialShape, GrainTexture, RouteLine, type DayCoverArtPosition } from "@/design-system";

function LabMotif({ variant }: { variant: DayCoverArtPosition }) { return <svg viewBox="0 0 320 360" aria-hidden="true" className="ds-lab-motif"><GrainTexture><RouteLine d="M20 300C90 240 180 270 300 100" /><BuildingBlock x={variant === "left" ? 172 : 54} y={120} width={120} height={190} /><ArchBlock x={70} y={165} width={90} height={145} /><DomeBlock cx={230} cy={118} radius={48} /><EditorialShape d="M32 286L94 198L148 286Z" /></GrainTexture></svg>; }

const meta = { title: "Patterns/DayCover Lab", component: DayCover, args: { dayNumber: "07", weekday: "Viernes", sequenceLabel: "Día 2 de 8", eyebrow: "Altura y horizonte", title: "La ciudad a tus pies", status: "2 anchors", theme: "pink-orange", artPosition: "back", active: true, debugBounds: false, motif: <LabMotif variant="back" /> }, argTypes: { artPosition: { control: "inline-radio", options: ["left", "back", "top"] }, theme: { control: "select", options: ["orange-night", "pink-orange", "violet-lime", "orange-black", "blue-pink", "illustrated-open-day", "sky-white"] } }, parameters: { layout: "centered", viewport: { defaultViewport: "mobile402" } }, decorators: [(Story) => <div className="ds-story-cover-frame"><Story /></div>] } satisfies Meta<typeof DayCover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Lab: Story = {};
export const DebugBounds: Story = { args: { debugBounds: true, artPosition: "top", dayNumber: "10", title: "Mercados, canales y música" } };
export const LongTitle: Story = { args: { title: "Un título deliberadamente largo que nunca debe ocupar más de tres líneas", dayNumber: "08", artPosition: "left" } };

const days = [
  ["06", "Jueves", "La primera línea del viaje", "orange-night", "left"],
  ["07", "Viernes", "La ciudad a tus pies", "pink-orange", "back"],
  ["08", "Sábado", "Rituales de museo y barrio", "violet-lime", "top"],
  ["09", "Domingo", "Un día abierto", "orange-black", "back"],
  ["10", "Lunes", "Mercados, canales y música", "blue-pink", "left"],
  ["11", "Martes", "Iconos en movimiento", "illustrated-open-day", "back"],
  ["12", "Miércoles", "La brújula del viaje", "sky-white", "top"],
  ["13", "Jueves", "Último capítulo londinense", "pink-orange", "back"],
] as const;
export const AllEightChapters: Story = { render: () => <div className="ds-story-cover-grid">{days.map(([number, weekday, title, theme, position], index) => <div className="ds-story-cover-frame" key={number}><DayCover dayNumber={number} weekday={weekday} sequenceLabel={`Día ${index + 1} de 8`} eyebrow="Capítulo de Londres" title={title} status={index % 2 ? "2 anchors" : "Día flexible"} theme={theme} artPosition={position} motif={<LabMotif variant={position} />} /></div>)}</div>, parameters: { layout: "fullscreen" } };
