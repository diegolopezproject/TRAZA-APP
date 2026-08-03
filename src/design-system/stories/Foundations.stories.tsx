import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = { title: "Foundations/Tokens", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const swatches = [
  ["text / primary", "--ds-color-text-primary"], ["surface / canvas", "--ds-color-surface-canvas"], ["surface / raised", "--ds-color-surface-raised"], ["action / accent", "--ds-color-action-accent"], ["status / planned", "--ds-color-status-planned"], ["focus", "--ds-color-focus"],
] as const;
export const SemanticColor: Story = { render: () => <div className="ds-foundation-grid">{swatches.map(([label, variable]) => <figure key={variable}><span style={{ background: `var(${variable})` }} /><figcaption><b>{label}</b><code>{variable}</code></figcaption></figure>)}</div> };
export const TypeAndSpacing: Story = { render: () => <div className="ds-foundation-type"><p className="ds-eyebrow">Caption / mono data</p><h1>Display editorial</h1><h2>Section title</h2><p>Body mantiene un ritmo legible y directo para decisiones durante el viaje.</p><div>{["1", "2", "3", "4", "5", "6", "8", "10", "12"].map((step) => <span key={step} style={{ width: `var(--ds-space-${step})` }}>{step}</span>)}</div></div> };
