import type { AppTab } from "@/lib/app-state";
import { motion } from "motion/react";
import { es } from "@/content/es";
import { HeartIcon, JourneyIcon, TicketIcon } from "./icons";
import { gestureSpring } from "@/lib/motion";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const items = [
  { id: "journey" as const, label: es.nav.journey, Icon: JourneyIcon },
  { id: "saved" as const, label: es.nav.saved, Icon: HeartIcon },
  { id: "trip" as const, label: es.nav.trip, Icon: TicketIcon },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label={es.nav.label}>
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-item${active === id ? " nav-item--active" : ""}`}
          type="button"
          aria-current={active === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          {active === id ? <motion.span className="nav-active-pill" layoutId="nav-active-pill" transition={gestureSpring} /> : null}
          <Icon />
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
