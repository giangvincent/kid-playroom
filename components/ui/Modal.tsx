"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type ModalProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, children, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
    >
      <div
        className={cx(
          "pixel-box max-h-full w-full max-w-md overflow-auto p-6",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
