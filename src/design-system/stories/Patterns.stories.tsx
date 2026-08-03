import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AssignmentFlow, Button, DayHeader, OrganizeToolbar, PlanCard, SavedPlaceCard, Surface, TripSectionCard } from "@/design-system";

const meta = { title: "Patterns/Product patterns", parameters: { layout: "padded", viewport: { defaultViewport: "mobile402" } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Journey: Story = { render: () => <Surface className="ds-story-screen"><DayHeader weekday="Viernes" date="07 agosto" title="La ciudad a tus pies" /><main className="ds-story-stack"><PlanCard time="10:00" title="Borough Market" meta="Anchor · Southwark" status="confirmed" action={<Button variant="quiet">Ver detalle</Button>} /><PlanCard title="Paseo por la ribera" meta="Intención · flexible" status="planned" /></main></Surface> };
export const Saved: Story = { render: () => <Surface className="ds-story-stack"><SavedPlaceCard title="Museum of Modern Stories" category="Museo" area="South Bank" /><SavedPlaceCard title="Regent's Canal" category="Paseo" area="Camden" /></Surface> };
export const Trip: Story = { render: () => <Surface className="ds-story-stack"><TripSectionCard index="01" title="Alojamiento"><p>Base del viaje en Londres</p></TripSectionCard><TripSectionCard index="02" title="Traslados"><p>Llegada y regreso</p></TripSectionCard></Surface> };
export const Assignment: Story = { render: () => <Surface className="ds-story-stack"><AssignmentFlow step={1} total={2} title="¿En qué día?" next={() => undefined}><Button variant="secondary">Viernes 07</Button><Button variant="secondary">Sábado 08</Button></AssignmentFlow></Surface> };
export const Organize: Story = { render: () => <Surface className="ds-story-screen"><div className="ds-story-spacer">Reordena sin perder anchors.</div><OrganizeToolbar count={2} onCancel={() => undefined} onSave={() => undefined} /></Surface> };
