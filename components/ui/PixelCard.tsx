import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type PixelCardProps = {
  children: ReactNode;
  className?: string;
};

export function PixelCard({ children, className }: PixelCardProps) {
  return <div className={cx("pixel-box p-4", className)}>{children}</div>;
}
