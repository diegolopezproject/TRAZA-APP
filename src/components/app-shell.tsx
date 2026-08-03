import type { ReactNode } from "react";
import type { AppTab } from "@/lib/app-state";

interface AppShellProps {
  activeTab: AppTab;
  editing?: boolean;
  children: ReactNode;
}

/** Shared viewport, safe-area and overlay coordinate system for every top-level section. */
export function AppShell({ activeTab, editing = false, children }: AppShellProps) {
  return (
    <main className={`app-shell app-shell--${activeTab}${editing ? " is-editing" : ""}`} data-active-section={activeTab}>
      {children}
    </main>
  );
}

