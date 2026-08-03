import type { CSSProperties, ReactNode } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import "../src/app/globals.css";
import "../src/design-system/stories/stories.css";
import { trazaViewports } from "../src/design-system/foundations/foundations";

type StoryGlobals = { motion?: "full" | "reduced"; transparency?: "full" | "reduced"; safeArea?: "none" | "iphone"; };
const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({ themes: { Electric: "electric", Paper: "paper", Night: "night" }, defaultTheme: "Electric", attributeName: "data-theme" }),
    (Story, context) => {
      const globals = context.globals as StoryGlobals;
      const safe = globals.safeArea === "iphone";
      const style = { "--ds-safe-top": safe ? "47px" : "0px", "--ds-safe-bottom": safe ? "34px" : "0px", minHeight: "100vh", padding: safe ? "47px 0 34px" : 0 } as CSSProperties;
      return <div data-motion={globals.motion} data-transparency={globals.transparency} style={style}>{Story() as ReactNode}</div>;
    },
  ],
  globalTypes: {
    motion: { description: "Motion preference", defaultValue: "full", toolbar: { icon: "play", items: [{ value: "full", title: "Motion" }, { value: "reduced", title: "Reduced motion" }] } },
    transparency: { description: "Transparency preference", defaultValue: "full", toolbar: { icon: "contrast", items: [{ value: "full", title: "Glass" }, { value: "reduced", title: "Opaque" }] } },
    safeArea: { description: "Safe area simulation", defaultValue: "none", toolbar: { icon: "mobile", items: [{ value: "none", title: "No safe area" }, { value: "iphone", title: "iPhone safe area" }] } },
  },
  parameters: {
    layout: "centered",
    viewport: { options: trazaViewports },
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "error" },
    options: { storySort: { order: ["TRAZA Design System", "Foundations", "Core", "Patterns", "Screens"] } },
  },
  tags: ["autodocs"],
};

export default preview;
