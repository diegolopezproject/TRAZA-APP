export const motionDuration = {
  instant: 0.08,
  fast: 0.12,
  standard: 0.22,
  expressive: 0.42,
} as const;

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const navigationMotion = {
  spring: { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.78 },
  distance: 24,
};

export const deckMotion = {
  spring: { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.9 },
  settleDurationMs: 220,
  openDistance: 72,
  minimumScale: .98,
};

export const modalMotion = {
  spring: { type: "spring" as const, stiffness: 360, damping: 38, mass: 0.92 },
  distance: 32,
};

export const microInteractionMotion = {
  duration: motionDuration.fast,
  ease: motionEase,
  pressedScale: .98,
};

export const backSwipeMotion = {
  edgeWidth: 24,
  complete: { duration: motionDuration.fast, ease: motionEase },
  cancel: { type: "spring" as const, stiffness: 420, damping: 38, mass: .82 },
};

// Compatibility aliases for existing expression components.
export const gestureSpring = deckMotion.spring;
export const sheetSpring = modalMotion.spring;
