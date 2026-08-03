import type { AppTab } from "@/lib/app-state";
import { es } from "@/content/es";
import { HeartIcon, JourneyIcon, TicketIcon } from "./icons";
import { BottomNavigation } from "@/design-system";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const items = [
  { id: "journey" as const, label: es.nav.journey, icon: <JourneyIcon /> },
  { id: "saved" as const, label: es.nav.saved, icon: <HeartIcon /> },
  { id: "trip" as const, label: es.nav.trip, icon: <TicketIcon /> },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return <BottomNavigation items={items} active={active} onChange={onChange} label={es.nav.label} />;
}
