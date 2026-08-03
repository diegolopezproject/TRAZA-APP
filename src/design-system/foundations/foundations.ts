export const trazaViewports = {
  mobile390: { name: "Mobile 390", styles: { width: "390px", height: "844px" } },
  mobile402: { name: "Mobile 402", styles: { width: "402px", height: "874px" } },
  mobile430: { name: "Mobile 430", styles: { width: "430px", height: "932px" } },
  tablet768: { name: "Tablet 768", styles: { width: "768px", height: "1024px" } },
  desktop1440: { name: "Desktop 1440", styles: { width: "1440px", height: "900px" } },
} as const;

export const coreStatusVariants = ["confirmed", "planned", "open", "saved", "researching", "evaluating"] as const;
export type CoreStatus = (typeof coreStatusVariants)[number];
