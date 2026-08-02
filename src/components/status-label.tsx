import type { ActivityLevel, ActivityStatus } from "@/domain/models";
import { es } from "@/content/es";
import { CheckIcon, ClockIcon, PlusIcon } from "./icons";

interface StatusLabelProps {
  status: ActivityStatus;
  level?: ActivityLevel;
  compact?: boolean;
  timeNeedsVerification?: boolean;
}

export function StatusLabel({ status, level, compact = false, timeNeedsVerification = false }: StatusLabelProps) {
  const Icon = status === "confirmed" ? CheckIcon : status === "unplanned" ? PlusIcon : ClockIcon;
  const label = timeNeedsVerification ? es.status.timeVerify : es.status[status];
  return (
    <span className={`status-label status-${status}${compact ? " status-label--compact" : ""}`}>
      <Icon />
      <span>{label}</span>
      {level && !compact && !timeNeedsVerification ? <span className="status-level">{es.levels[level]}</span> : null}
    </span>
  );
}
