import type { ReactNode } from "react";
import type { AppTab } from "@/lib/app-state";

interface AppShellProps {
  activeTab: AppTab;
  journeyTheme?: string;
  editing?: boolean;
  children: ReactNode;
}

/** Shared viewport, safe-area and overlay coordinate system for every top-level section. */
export function AppShell({ activeTab, journeyTheme, editing = false, children }: AppShellProps) {
  return (
    <main className={`app-shell app-shell--${activeTab}${editing ? " is-editing" : ""}`} data-active-section={activeTab} data-journey-theme={activeTab === "journey" ? journeyTheme : undefined}>
      {children}
    </main>
  );
}
