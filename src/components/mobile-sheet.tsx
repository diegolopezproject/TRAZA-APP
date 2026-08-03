import type { ReactNode } from "react";
import { Sheet } from "@/design-system";

interface MobileSheetProps {
  title: string;
  kicker: string;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
  handle?: boolean;
}

export function MobileSheet({ title, kicker, closeLabel, children, footer, onClose, wide = false, handle = true }: MobileSheetProps) {
  return <Sheet title={title} kicker={kicker} closeLabel={closeLabel} footer={footer} onClose={onClose} wide={wide} handle={handle}>{children}</Sheet>;
}
