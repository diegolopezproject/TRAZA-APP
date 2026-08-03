import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({ theme: create({ base: "light", brandTitle: "TRAZA Design System 1.0", colorPrimary: "#161616", colorSecondary: "#6d45e5", appBg: "#f4f1ea", appContentBg: "#ffffff", appBorderColor: "#161616", fontBase: "Arial, sans-serif", fontCode: "monospace" }) });
