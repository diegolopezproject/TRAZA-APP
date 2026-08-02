export const motionDuration = {
  instant: 0.08,
  fast: 0.16,
  standard: 0.24,
  expressive: 0.42,
} as const;

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const gestureSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 0.9,
};

export const sheetSpring = {
  type: "spring" as const,
  stiffness: 360,
  damping: 38,
  mass: 0.92,
};

