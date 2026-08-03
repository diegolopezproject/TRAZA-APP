import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const days = [
  ["06", "Primera tarde en Londres", "Llegada · Ealing · paseo"],
  ["07", "La City desde las alturas", "Sky Garden · City · Canary Wharf"],
  ["08", "Notting Hill a todo color", "Notting Hill · South Kensington"],
  ["09", "El centro se vuelve verde", "Centro · West End"],
  ["10", "De Camden a Whitechapel", "Bloomsbury · Camden · Whitechapel"],
];

const meta = { title: "Experiments/Day Navigation/Vertical Stack", parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile402" } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const ComparisonOnly: Story = { render: () => <main className="ds-vertical-stack"><header><span>Londres 2026</span><h1>Días</h1></header>{days.map(([number, title, summary], index) => <button className={index === 1 ? "is-current" : ""} type="button" key={number}><strong>{number}</strong><span><b>{title}</b><small>{summary}</small></span><i>{index === 1 ? "Actual" : "Abrir"}</i></button>)}</main> };
